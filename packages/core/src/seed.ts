import { eq } from "drizzle-orm";
import { getDb } from "./db/client";
import { brands, users } from "./db/schema";
import { hashPassword } from "./crypto";
import { env } from "./env";
import { createBrand } from "./services/brands";
import { log } from "./logger";

/**
 * Idempotent seed: one admin user + the two brands you actually run today.
 * The faceless-page brands get created from the Studio UI (Settings → Brands).
 */
export async function seed(): Promise<void> {
  const db = await getDb();
  const e = env();

  const existingUser = await db.select().from(users).where(eq(users.email, e.ADMIN_EMAIL)).limit(1);
  if (!existingUser[0]) {
    await db.insert(users).values({
      email: e.ADMIN_EMAIL,
      name: e.ADMIN_NAME,
      passwordHash: hashPassword(e.ADMIN_PASSWORD),
      role: "owner",
    });
    log.info({ email: e.ADMIN_EMAIL }, "created admin user");
  }

  const seeds: Array<{ name: string; slug: string; pillars: string[]; targetAudience: string; toneGuide: string; hashtagSets: Record<string, string[]> }> = [
    {
      name: "Centum App",
      slug: "centum-app",
      pillars: ["Study material", "Question of the day", "Exam strategy", "App features"],
      targetAudience: "Tamil Nadu school students (10th & 12th) and their parents",
      toneGuide: "Encouraging, exam-focused, plain Tamil mixed with English technical words. Numbers and results over hype.",
      hashtagSets: {
        default: ["#centumapp", "#tnstudents", "#samacheer", "#tnschool", "#examprep"],
        tenth: ["#tn10th", "#10thmaths", "#tnboardexam"],
        twelfth: ["#tn12th", "#12thbio", "#tnboardexam"],
      },
    },
    {
      name: "Ravi's Tuition",
      slug: "ravis-tuition",
      pillars: ["Class updates", "Student results", "Parent info", "Admissions"],
      targetAudience: "Parents of school students in and around Madurai",
      toneGuide: "Warm, local, trustworthy. Speak to parents as much as students.",
      hashtagSets: { default: ["#maduraituition", "#tuitioncentre", "#tnschool", "#results"] },
    },
    {
      name: "Centum Shorts",
      slug: "centum-shorts",
      // The faceless funnel pages: no faces, no names, pure study value that
      // sends people to the app. Every post here must be helpful on its own.
      pillars: ["60-second concepts", "Mistake of the day", "Formula flash", "Exam countdown"],
      targetAudience: "Students scrolling Shorts and Reels at 9pm — reach them with one useful idea",
      toneGuide: "Fast, visual, zero fluff. One idea per clip, the answer revealed on screen, app named once at the end.",
      hashtagSets: {
        default: ["#centumapp", "#tnstudents", "#studytips", "#shorts"],
        quickmaths: ["#mathstricks", "#tn10th", "#centumapp"],
        neet: ["#neetprep", "#biology", "#tn12th"],
      },
    },
  ];

  for (const brand of seeds) {
    const existing = await db.select().from(brands).where(eq(brands.slug, brand.slug)).limit(1);
    if (existing[0]) continue;
    await createBrand(brand);
    log.info({ brand: brand.name }, "seeded brand");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await seed();
  const { getRuntime } = await import("./db/client");
  const runtime = await getRuntime();
  await runtime.close();
  log.info("seed complete");
}
