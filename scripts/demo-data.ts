/**
 * `npm run demo:data` — fills the studio with a realistic working history so the
 * dashboard, calendar and queue show what they look like with real usage.
 *
 * Idempotent: everything it creates is marked (accounts `demo_*`, posts
 * `demo:*`, assets `demo_*`), so it clears its own rows and rebuilds them.
 *
 * Honest about one thing: the published history is generated, because the
 * publishers arrive in S4/S5. Every number on screen, though, is computed from
 * the database by the same queries production uses — swap in real publishing and
 * only the source of the rows changes.
 */
import { eq, like } from "drizzle-orm";
import { getBrandBySlug, getDb, recordEvent, tables, createPost, approvePost, getRuntime } from "@centum/core";

const { accounts, assets, events, metricsPost, postAssets, postTargets, posts, settings } = tables;
const DEMO_VERSION = "2026-10-15b";
const DB = await getDb();

// deterministic pseudo-random so re-runs look identical
let seedValue = 42;
const rand = () => {
  seedValue = (seedValue * 1103515245 + 12345) % 2147483648;
  return seedValue / 2147483648;
};
const between = (min: number, max: number) => Math.round(min + rand() * (max - min));

const IST = 5.5 * 60 * 60 * 1000;
/**
 * A specific IST wall-clock time, `daysFromToday` days from now (positive =
 * future). Getting this sign wrong once put the whole demo history in the future
 * and every scheduled post in the past, which read on the dashboard as "nothing
 * planned, everything already out".
 */
function istAt(daysFromToday: number, hour: number, minute: number): Date {
  const shifted = new Date(Date.now() + IST);
  shifted.setUTCHours(hour, minute, 0, 0);
  return new Date(shifted.getTime() + daysFromToday * 864e5 - IST);
}
const dayKey = (date: Date) => new Date(date.getTime() + IST).toISOString().slice(0, 10);

// ── 1. clear anything a previous run created ────────────────────────────────
const demoPosts = await DB.select({ id: posts.id }).from(posts).where(like(posts.externalId, "demo:%"));
if (demoPosts.length) {
  const ids = demoPosts.map((row) => row.id);
  await DB.delete(postAssets).where(eq(postAssets.postId, ids[0]!));
  for (const id of ids) await DB.delete(posts).where(eq(posts.id, id));
}
await DB.delete(assets).where(like(assets.driveFileId, "demo_%"));
await DB.delete(accounts).where(like(accounts.platformAccountId, "demo_%"));
await DB.delete(events).where(eq(events.type, "demo.seed"));
console.log("· cleared previous demo rows");

// ── 2. brands and accounts ──────────────────────────────────────────────────
const centum = await getBrandBySlug("centum-app");
const tuition = await getBrandBySlug("ravis-tuition");
const shorts = await getBrandBySlug("centum-shorts");
if (!centum || !tuition) throw new Error("Run `npm run db:seed` first — brands are missing.");

const [igMain] = await DB.insert(accounts)
  .values({
    platform: "instagram",
    authPath: "instagram_login",
    platformAccountId: "demo_instagram_centum",
    handle: "@centum.app",
    displayName: "Centum App",
    brandId: centum.id,
    scopes: ["instagram_business_basic", "instagram_business_content_publish"],
    expiresAt: new Date(Date.now() + 41 * 864e5),
    dailyCap: 3,
  })
  .returning();
const [igTuition] = await DB.insert(accounts)
  .values({
    platform: "instagram",
    authPath: "instagram_login",
    platformAccountId: "demo_instagram_tuition",
    handle: "@ravis.tuition",
    displayName: "Ravi's Tuition",
    brandId: tuition.id,
    scopes: ["instagram_business_basic", "instagram_business_content_publish"],
    expiresAt: new Date(Date.now() + 52 * 864e5),
    dailyCap: 2,
  })
  .returning();
const [ytShorts] = await DB.insert(accounts)
  .values({
    platform: "youtube",
    authPath: "google",
    platformAccountId: "demo_youtube_centum",
    handle: "@centumshorts",
    displayName: "Centum Shorts",
    brandId: (shorts ?? centum).id,
    scopes: ["https://www.googleapis.com/auth/youtube.upload"],
    expiresAt: new Date(Date.now() + 8 * 864e5),
    dailyCap: 2,
  })
  .returning();
const [igShorts] = await DB.insert(accounts)
  .values({
    platform: "instagram",
    authPath: "instagram_login",
    platformAccountId: "demo_instagram_shorts",
    handle: "@centum.shorts",
    displayName: "Centum Shorts (faceless)",
    brandId: (shorts ?? centum).id,
    scopes: ["instagram_business_basic", "instagram_business_content_publish"],
    expiresAt: new Date(Date.now() + 47 * 864e5),
    dailyCap: 3,
  })
  .returning();

for (const account of [igMain!, igTuition!, ytShorts!, igShorts!]) {
  await recordEvent({ type: "account.connected", subject: account.id, payload: { platform: account.platform, handle: account.handle, mode: "demo" } });
}
console.log("· 4 accounts connected (Centum App, Ravi's Tuition, faceless page, YouTube)");

// ── 3. media box ────────────────────────────────────────────────────────────
const mediaRows = [
  { fileName: "tn10-maths-trigonometry-q4.mp4", kind: "video" as const, width: 1080, height: 1920, durationS: 38, bytes: 18_400_000, mime: "video/mp4" },
  { fileName: "mole-concept-in-60s.mp4", kind: "video" as const, width: 1080, height: 1920, durationS: 57, bytes: 26_100_000, mime: "video/mp4" },
  { fileName: "half-yearly-timetable.png", kind: "image" as const, width: 1080, height: 1350, durationS: null, bytes: 812_000, mime: "image/png" },
  { fileName: "admissions-weekend-batch.jpg", kind: "image" as const, width: 1080, height: 1350, durationS: null, bytes: 640_000, mime: "image/jpeg" },
  { fileName: "formula-flash-quadratics.mp4", kind: "video" as const, width: 1080, height: 1920, durationS: 22, bytes: 9_700_000, mime: "video/mp4" },
];
for (const media of mediaRows) {
  await DB.insert(assets).values({
    source: "drive",
    driveFileId: `demo_${media.fileName}`,
    fileName: media.fileName,
    mimeType: media.mime,
    kind: media.kind,
    width: media.width,
    height: media.height,
    durationS: media.durationS,
    bytes: media.bytes,
    probe: { demo: true, codec: media.kind === "video" ? "h264" : undefined },
    validation: { ok: true, issues: [], warnings: ["Mirror to R2 before publishing — Meta and YouTube reject Drive links."] },
    createdBy: "human",
  });
  await recordEvent({ type: "asset.created", payload: { fileName: media.fileName, source: "drive" } });
}
console.log(`· ${mediaRows.length} media assets in the box (Drive-sourced, waiting for the R2 mirror)`);

// ── 4. three weeks of history, two weeks ahead, three awaiting review ───────
type Plan = {
  title: string;
  caption: string;
  hashtags: string[];
  pillar: string;
  brandId: string;
  targets: { accountId: string; mediaType: "REEL" | "IMAGE" | "SHORT" | "CAROUSEL" }[];
  days: number;
  hour: number;
  minute: number;
  outcome?: "posted" | "failed_youtube" | "needs_review";
};

const contentPlan: Plan[] = [
  { title: "TN10 Maths — Trigonometry Q4", caption: "இன்றைய கணக்கு 📐\n\n10-ஆம் வகுப்பு கணிதம் — முக்கோணவியல் பயிற்சி 4.\n\nவிடையை comment-ல் சொல்லுங்க 👇", hashtags: ["#centumapp", "#tn10maths", "#samacheer"], pillar: "Question of the day", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: -20, hour: 20, minute: 30, outcome: "posted" },
  { title: "Mole concept in 60 seconds", caption: "Mole concept — 60 வினாடியில் 🧪\n\nஒரு பார்முலா, ஒரு example. மீதம் உங்கள் பயிற்சி.", hashtags: ["#centumapp", "#chemistry", "#tn12th"], pillar: "60-second concepts", brandId: (shorts ?? centum).id, targets: [{ accountId: igShorts!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: -19, hour: 21, minute: 0, outcome: "posted" },
  { title: "Half-yearly exam timetable released", caption: "Half-yearly timetable வந்துவிட்டது 🗓️\n\nஉங்கள் பள்ளியின் தேதிகளை இங்கே பார்க்கலாம். தயாரிப்பை இன்றே தொடங்குங்க.", hashtags: ["#tnschool", "#examprep"], pillar: "Exam strategy", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "IMAGE" }], days: -18, hour: 8, minute: 0, outcome: "posted" },
  { title: "5 mistakes in 10th Maths exams", caption: "10th கணிதத்தில் மாணவர்கள் செய்யும் 5 தவறுகள் ❌\n\n1. Formula-வை மறந்துவிடுவது\n2. Steps எழுதாமல் விடுவது\n3. Time management\n\nSave செய்து வைத்துக்கொள்ளுங்கள்.", hashtags: ["#tn10th", "#maths", "#centumapp"], pillar: "Mistake of the day", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }, { accountId: igShorts!.id, mediaType: "REEL" }], days: -16, hour: 20, minute: 45, outcome: "posted" },
  { title: "Weekend batch — admissions open", caption: "Weekend batch-க்கு இடம் கிடைக்கிறது 🎓\n\n10th & 12th — Maths, Science, Bio.\nMadurai. Call to book a slot.", hashtags: ["#maduraituition", "#tuitioncentre"], pillar: "Admissions", brandId: tuition.id, targets: [{ accountId: igTuition!.id, mediaType: "IMAGE" }], days: -15, hour: 17, minute: 15, outcome: "posted" },
  { title: "NEET Biology — Genetics MCQ", caption: "Genetics MCQ — answer தெரியுமா? 🧬\n\nComment-ல் சொல்லுங்க, நாளை விடை.", hashtags: ["#neetprep", "#biology", "#tn12th"], pillar: "Question of the day", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }], days: -14, hour: 21, minute: 15, outcome: "posted" },
  { title: "Student result — 3 marks from centum", caption: "3 மார்க் மட்டுமே centum-ல இருந்து தவறியது 👏\n\nகடின உழைப்புக்கு நல்ல பலன். அடுத்த முறை நூறு!", hashtags: ["#studentresults", "#maduraituition"], pillar: "Student results", brandId: tuition.id, targets: [{ accountId: igTuition!.id, mediaType: "IMAGE" }], days: -13, hour: 19, minute: 30, outcome: "posted" },
  { title: "Formula flash — quadratic equations", caption: "Quadratic formula ⚡\n\nSave பண்ணி வைங்க, exam-க்கு முன் ஒரு முறை பாருங்க.", hashtags: ["#mathstricks", "#centumapp"], pillar: "Formula flash", brandId: (shorts ?? centum).id, targets: [{ accountId: igShorts!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: -12, hour: 8, minute: 30, outcome: "posted" },
  { title: "TN12 Physics — Current Electricity Q2", caption: "12-ஆம் வகுப்பு இயற்பியல் — மின்னோட்டவியல் கணக்கு ⚡\n\nStep by step விடை கீழே.", hashtags: ["#tn12th", "#physics", "#centumapp"], pillar: "Question of the day", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }], days: -10, hour: 20, minute: 0, outcome: "posted" },
  { title: "Study plan — 7 days before exam", caption: "தேர்வுக்கு 7 நாட்கள் மட்டுமே ⏳\n\nDay 1-2: பாடம் முழுவதும்\nDay 3-4: பழைய வினாத்தாள்\nDay 5-6: மறுபார்வை\nDay 7: ஓய்வு + சூத்திரங்கள்", hashtags: ["#examprep", "#studytips", "#centumapp"], pillar: "Exam strategy", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "CAROUSEL" }], days: -9, hour: 21, minute: 30, outcome: "posted" },
  { title: "10th English — prose summary", caption: "10th English prose — ஒரு நிமிடத்தில் சுருக்கம் 📖\n\nBoard exam-க்கு இது போதும்.", hashtags: ["#tn10th", "#english"], pillar: "Study material", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }], days: -8, hour: 20, minute: 15, outcome: "posted" },
  { title: "Class 12 Bio — diagram practice", caption: "Diagram வரைவதில் மார்க் எளிது ✍️\n\nஇந்த 6 diagram-கள் guaranteed.", hashtags: ["#tn12th", "#biology", "#centumapp"], pillar: "Study material", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "IMAGE" }, { accountId: igShorts!.id, mediaType: "IMAGE" }], days: -6, hour: 9, minute: 0, outcome: "posted" },
  { title: "Daily quiz — 10 questions in 60s", caption: "10 கேள்விகள், 60 வினாடிகள் ⏱️\n\nஎத்தனை சரி? Comment-ல் சொல்லுங்க.", hashtags: ["#centumapp", "#quiz", "#tnstudents"], pillar: "Question of the day", brandId: (shorts ?? centum).id, targets: [{ accountId: igShorts!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: -5, hour: 21, minute: 0, outcome: "posted" },
  { title: "Parent info — how to help at home", caption: "பெற்றோருக்கான ஒரு குறிப்பு 🏠\n\nதினமும் 30 நிமிடம் படிக்கும் பழக்கம் — மதிப்பெண்ணை மாற்றும்.", hashtags: ["#parents", "#maduraituition"], pillar: "Parent info", brandId: tuition.id, targets: [{ accountId: igTuition!.id, mediaType: "IMAGE" }], days: -4, hour: 18, minute: 0, outcome: "posted" },
  { title: "Samacheer 10th — Tamil paper 1 tips", caption: "தமிழ் paper 1 — மார்க் எடுக்கும் 4 வழிகள் 📝\n\nSave பண்ணிக்கோங்க.", hashtags: ["#tn10th", "#tamil", "#samacheer"], pillar: "Exam strategy", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }], days: -3, hour: 20, minute: 30, outcome: "posted" },
  { title: "Chemistry — periodic table trick", caption: "Periodic table-ஐ எப்படி நினைவில் வைப்பது 🧪\n\nஇந்த trick-ஐ try பண்ணுங்க.", hashtags: ["#chemistry", "#centumapp", "#studytips"], pillar: "60-second concepts", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: -2, hour: 21, minute: 15, outcome: "failed_youtube" },
  { title: "Centum App — question bank update", caption: "App-ல புதிய question bank வந்தது 📱\n\n10th & 12th — அத்தியாயம் வாரியாக.", hashtags: ["#centumapp", "#appupdate"], pillar: "App features", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "IMAGE" }], days: -1, hour: 19, minute: 45, outcome: "posted" },

  // today
  { title: "Evening quiz — Tamil grammar", caption: "இன்று மாலை quiz ⏰\n\nதமிழ் இலக்கணம் — 10 கேள்விகள். Ready-யா?", hashtags: ["#tn10th", "#tamil", "#centumapp"], pillar: "Question of the day", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }, { accountId: igShorts!.id, mediaType: "REEL" }], days: 0, hour: 17, minute: 0 },
  { title: "Formula flash — tonight's revision", caption: "இரவு படிக்கும் முன் ஒரு முறை 👀\n\nஇந்த 6 சூத்திரங்கள் மட்டும்.", hashtags: ["#mathstricks", "#tn10th"], pillar: "Formula flash", brandId: (shorts ?? centum).id, targets: [{ accountId: igShorts!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: 0, hour: 20, minute: 30 },

  // the fortnight ahead
  { title: "Admissions — weekend batch reminder", caption: "Weekend batch நாளை தொடங்குகிறது 🎓\n\nஇடம் கிடைக்க Call பண்ணுங்க.", hashtags: ["#maduraituition", "#admissions"], pillar: "Admissions", brandId: tuition.id, targets: [{ accountId: igTuition!.id, mediaType: "IMAGE" }], days: 1, hour: 8, minute: 0 },
  { title: "TN10 Science — one-mark questions", caption: "ஒரு மார்க் கேள்விகள் — எளிதில் முழு மார்க் ✅\n\nஇந்த 20 கேள்விகளை முன்னாடி பாருங்க.", hashtags: ["#tn10th", "#science", "#centumapp"], pillar: "Question of the day", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: 1, hour: 20, minute: 30 },
  { title: "Formula flash — trigonometry values", caption: "Trigonometry values table ⚡\n\nScreen shot எடுத்து வைங்க.", hashtags: ["#mathstricks", "#centumapp"], pillar: "Formula flash", brandId: (shorts ?? centum).id, targets: [{ accountId: igShorts!.id, mediaType: "REEL" }], days: 2, hour: 9, minute: 0 },
  { title: "Class 12 Chemistry — organic basics", caption: "Organic chemistry — அடிப்படை ஒரு நிமிடத்தில் 🧬\n\nதொடர்ந்து பாருங்க, series-ஆ வரும்.", hashtags: ["#tn12th", "#chemistry"], pillar: "60-second concepts", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }], days: 3, hour: 20, minute: 0 },
  { title: "Student spotlight — biology topper", caption: "இந்த வாரத்தின் மாணவி 🌟\n\nBio-ல 98. உழைப்பு எப்போதும் பேசும்.", hashtags: ["#studentresults", "#maduraituition"], pillar: "Student results", brandId: tuition.id, targets: [{ accountId: igTuition!.id, mediaType: "IMAGE" }], days: 4, hour: 18, minute: 30 },
  { title: "Daily quiz — physics formulas", caption: "Physics formulas — quiz format-ல 🎯\n\nஎத்தனை ஞாபகம் இருக்கு?", hashtags: ["#quiz", "#physics", "#centumapp"], pillar: "Question of the day", brandId: (shorts ?? centum).id, targets: [{ accountId: igShorts!.id, mediaType: "REEL" }, { accountId: ytShorts!.id, mediaType: "SHORT" }], days: 5, hour: 21, minute: 0 },
  { title: "Exam countdown — 30 days to go", caption: "Board exam-க்கு இன்னும் 30 நாட்கள் ⏳\n\nஇன்று முதல் தினமும் 2 மணி நேரம்.", hashtags: ["#examprep", "#tnboardexam"], pillar: "Exam strategy", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "IMAGE" }], days: 6, hour: 7, minute: 30 },
  { title: "App feature — offline download", caption: "இன்டர்நெட் இல்லாமலும் படிக்கலாம் 📥\n\nOffline download feature.", hashtags: ["#centumapp", "#appupdate"], pillar: "App features", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }], days: 8, hour: 20, minute: 30 },

  // waiting on the owner
  { title: "Weekend batch — final seats", caption: "கடைசி 4 இடங்கள் மட்டுமே 🎓\n\nஇன்றே confirm பண்ணுங்க.", hashtags: ["#admissions", "#maduraituition"], pillar: "Admissions", brandId: tuition.id, targets: [{ accountId: igTuition!.id, mediaType: "IMAGE" }], days: 2, hour: 10, minute: 0, outcome: "needs_review" },
  { title: "TN12 Maths — integration shortcut", caption: "Integration shortcut 🧮\n\nஇதைத் தெரிந்தால் நேரம் மிச்சம்.", hashtags: ["#tn12th", "#maths", "#centumapp"], pillar: "Study material", brandId: centum.id, targets: [{ accountId: igMain!.id, mediaType: "REEL" }, { accountId: igShorts!.id, mediaType: "REEL" }], days: 3, hour: 20, minute: 45, outcome: "needs_review" },
  { title: "Parent-teacher meeting notice", caption: "PTM — இந்த ஞாயிறு காலை 10 மணி 🏫\n\nஅனைவரும் வருக.", hashtags: ["#parents", "#maduraituition"], pillar: "Parent info", brandId: tuition.id, targets: [{ accountId: igTuition!.id, mediaType: "IMAGE" }], days: 5, hour: 17, minute: 0, outcome: "needs_review" },
];

let published = 0;
let scheduled = 0;
let review = 0;

for (const plan of contentPlan) {
  const when = istAt(plan.days, plan.hour, plan.minute);
  const externalId = `demo:${plan.days}:${plan.hour}${plan.minute}:${plan.title.slice(0, 26).replace(/\s+/g, "-").toLowerCase()}`;

  if (plan.outcome === "posted" || plan.outcome === "failed_youtube") {
    const [post] = await DB.insert(posts)
      .values({
        brandId: plan.brandId,
        title: plan.title,
        captionMaster: plan.caption,
        hashtags: plan.hashtags,
        pillar: plan.pillar,
        scheduledAt: when,
        state: plan.outcome === "failed_youtube" ? "partially_failed" : "posted",
        approvalSource: "ui",
        approvedBy: "human:owner",
        approvedAt: new Date(when.getTime() - 3 * 3600_000),
        createdBy: "human",
        externalId,
      })
      .returning();

    await recordEvent({ type: "post.created", actor: "human:owner", subject: post!.id, payload: { title: plan.title, targets: plan.targets.length, pillar: plan.pillar } });

    for (const [index, target] of plan.targets.entries()) {
      const isYoutube = target.mediaType === "SHORT";
      const fails = plan.outcome === "failed_youtube" && isYoutube;

      const [row] = await DB.insert(postTargets)
        .values({
          postId: post!.id,
          accountId: target.accountId,
          platform: isYoutube ? "youtube" : "instagram",
          mediaType: target.mediaType,
          scheduledAt: when,
          publishedAt: fails ? null : when,
          remoteId: fails ? null : `${isYoutube ? "yt" : "ig"}_demo_${post!.id.slice(0, 8)}_${index}`,
          remoteUrl: null, // demo history has no real permalink — blank beats a dead link
          state: fails ? "failed" : "posted",
          attempts: fails ? 3 : 1,
          errorCode: fails ? "quota_exceeded" : null,
          errorMessage: fails ? "YouTube quota exceeded for today (videos.insert). The upload was refused before it started." : null,
        })
        .returning();

      if (fails) {
        await recordEvent({ type: "target.failed", subject: row!.id, payload: { message: "YouTube quota exceeded (videos.insert)", platform: "youtube" } });
        continue;
      }

      const isReel = target.mediaType === "REEL" || target.mediaType === "SHORT";
      const reach = isYoutube ? between(1800, 26000) : isReel ? between(2500, 21000) : between(700, 4200);
      const likes = Math.round(reach * (isReel ? 0.07 + rand() * 0.05 : 0.035 + rand() * 0.03));
      const comments = Math.round(likes * (0.04 + rand() * 0.06));
      const saves = Math.round(likes * (0.1 + rand() * 0.15));
      const shares = Math.round(likes * (0.05 + rand() * 0.1));

      await DB.insert(metricsPost).values({
        postTargetId: row!.id,
        date: dayKey(when),
        likes,
        comments,
        saves,
        shares,
        reach,
        plays: isYoutube ? reach : 0,
        watchTimeS: isYoutube ? Math.round(reach * 0.6) : 0,
        avgViewPct: isYoutube ? 40 + rand() * 45 : null,
      });

      await recordEvent({ type: "target.published", subject: row!.id, payload: { platform: isYoutube ? "youtube" : "instagram", title: plan.title } });
      published += 1;
    }
    continue;
  }

  // Review and scheduled-ahead posts go through the real service path, so the
  // queue, jobs and audit trail are built exactly as the UI builds them.
  const post = await createPost({
    brandId: plan.brandId,
    title: plan.title,
    caption: plan.caption,
    hashtags: plan.hashtags,
    pillar: plan.pillar,
    scheduledAt: when,
    state: plan.outcome === "needs_review" ? "needs_review" : "queued",
    createdBy: "human",
    externalId,
    targets: plan.targets.map((target) => ({ accountId: target.accountId, mediaType: target.mediaType })),
  });

  if (plan.outcome === "needs_review") {
    review += 1;
  } else {
    await approvePost(post.id, "human:owner", "ui");
    scheduled += plan.targets.length;
  }
}

console.log(`· ${published} published targets with metrics · ${scheduled} scheduled ahead · ${review} waiting on you`);

// ── 5. remember that demo data is in the database ───────────────────────────
await DB.insert(settings)
  .values({ key: "demo.data", value: { version: DEMO_VERSION, seededAt: new Date().toISOString() } })
  .onConflictDoUpdate({ target: settings.key, set: { value: { version: DEMO_VERSION, seededAt: new Date().toISOString() }, updatedAt: new Date() } });

console.log("\nDone — the dashboard, calendar and queue now have three weeks of history behind them.");
console.log("If the dev server was already running, restart it: embedded Postgres is single-process,");
console.log("so an already-started server cannot see rows written by this script.");
console.log("Start over any time with:  npm run db:reset && npm run db:seed && npm run demo:data");

await (await getRuntime()).close();
