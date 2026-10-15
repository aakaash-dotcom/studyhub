/**
 * `npm run demo:data` — creates a demo account pair and two posts so a fresh
 * install has something to click through (and so the pipeline can be verified
 * end-to-end without a single real credential).
 *
 * Safe to re-run; it exits early if demo data already exists.
 */
import {
  approvePost,
  createAccount,
  createPost,
  getBrandBySlug,
  getRuntime,
  listAccounts,
  listQueue,
  log,
} from "@centum/core";

const existing = await listAccounts();
const demoInstagram = existing.find((a) => a.platform === "instagram" && a.platformAccountId.startsWith("demo_"));
const demoYoutube = existing.find((a) => a.platform === "youtube" && a.platformAccountId.startsWith("demo_"));

const instagram = demoInstagram ?? (await createAccount({
  platform: "instagram",
  authPath: "instagram_login",
  platformAccountId: `demo_instagram_main`,
  handle: "@centum.app",
  displayName: "Centum App (demo)",
  accessToken: "demo-token",
  scopes: ["instagram_business_basic", "instagram_business_content_publish"],
  expiresAt: new Date(Date.now() + 60 * 864e5),
  dailyCap: 10,
}));

const youtube = demoYoutube ?? (await createAccount({
  platform: "youtube",
  authPath: "google",
  platformAccountId: `demo_youtube_main`,
  handle: "Centum App Shorts (demo)",
  displayName: "Centum App Shorts (demo)",
  accessToken: "demo-token",
  scopes: ["youtube.upload"],
  expiresAt: new Date(Date.now() + 60 * 864e5),
  dailyCap: 10,
}));

const centum = await getBrandBySlug("centum-app");
const tuition = await getBrandBySlug("ravis-tuition");
if (!centum || !tuition) throw new Error("Seed brands missing — run `npm run db:seed` first.");

const queue = await listQueue(50);
if (!queue.length) {
  const quiz = await createPost({
    brandId: centum.id,
    title: "TN10 Maths — Trigonometry Q4",
    caption: "இன்றைய கணக்கு 📐\n\n10-ஆம் வகுப்பு கணிதம் — முக்கோணவியல் பயிற்சி 4.\n\nவிடையை comment-ல் சொல்லுங்க 👇\n\n#centumapp #tn10maths #samacheer",
    hashtags: ["#centumapp", "#tn10maths", "#samacheer"],
    pillar: "Question of the day",
    scheduledAt: new Date(Date.now() + 26 * 3600 * 1000),
    state: "needs_review",
    createdBy: "human",
    targets: [
      { accountId: instagram.id, mediaType: "REEL" },
      { accountId: youtube.id, mediaType: "SHORT" },
    ],
  });

  const admission = await createPost({
    brandId: tuition.id,
    title: "Class 10 batch — weekend slots open",
    caption: "Weekend batch-க்கு இடம் கிடைக்கிறது 🎓\n\n10th & 12th — Maths, Science, Bio.\nMadurai. Call to book a slot.\n\n#madurain tuition #tnschool",
    hashtags: ["#tuitions", "#madurai", "#tnschool"],
    pillar: "Admissions",
    scheduledAt: new Date(Date.now() + 50 * 3600 * 1000),
    state: "needs_review",
    createdBy: "human",
    targets: [{ accountId: instagram.id, mediaType: "IMAGE" }],
  });

  // Prove the approval path: approving queues jobs for every target.
  await approvePost(quiz.id, "human:studio", "ui");

  log.info({ quiz: quiz.id, admission: admission.id }, "demo posts created (one approved & queued)");
}

const finalQueue = await listQueue(10);
console.log(`Queue rows: ${finalQueue.length}`);
for (const row of finalQueue) {
  console.log(`  ${row.platform.padEnd(10)} ${row.handle.padEnd(24)} ${row.mediaType.padEnd(7)} ${row.state.padEnd(13)} ${row.runAt?.toISOString() ?? "-"}`);
}

await (await getRuntime()).close();
