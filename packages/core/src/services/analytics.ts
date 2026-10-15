import { and, desc, eq, gte, inArray, isNotNull, lt, lte, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { accounts, assets, brands, events, metricsPost, postTargets, posts } from "../db/schema";
import type { Platform } from "../constants";
import type { MediaType, PostState, TargetState } from "../constants";

/**
 * Everything the dashboard needs, in one round of queries.
 *
 * The dashboard is the screen that has to answer "is anything wrong, and what do
 * I do next?" in five seconds, so these numbers are computed from the same tables
 * the queue publishes from — never from a cache that can disagree with reality.
 * Every function tolerates an empty database: a fresh install shows zeros, not an
 * error page.
 */

export type DayBucket = {
  /** YYYY-MM-DD in IST — the studio works in Madras time, not UTC. */
  date: string;
  label: string;
  scheduled: number;
  published: number;
};

export type PipelineRow = { state: PostState; label: string; count: number; tone: string };

export type AccountCard = {
  id: string;
  platform: Platform;
  handle: string;
  displayName: string;
  brandName: string;
  status: string;
  dailyCap: number;
  postedToday: number;
  queuedCount: number;
  nextRunAt: Date | null;
  lastError: string | null;
  tokenExpiresAt: Date | null;
  /** Whole days until the access token expires, when the platform gives us one. */
  tokenDaysLeft: number | null;
};

export type BrandCard = {
  id: string;
  name: string;
  slug: string;
  colorHex: string | null;
  scheduled: number;
  needsReview: number;
  published30: number;
  reach30: number;
  pillars: string[];
};

export type ActivityItem = {
  at: Date;
  type: string;
  actor: string;
  subject: string | null;
  summary: string;
  tone: "neutral" | "success" | "warning" | "danger" | "brand";
};

export type UpcomingItem = {
  postId: string;
  title: string;
  brandName: string;
  platform: Platform;
  mediaType: MediaType;
  scheduledAt: Date | null;
  state: TargetState;
};

export type TopPost = {
  postId: string;
  title: string;
  platform: Platform;
  handle: string;
  publishedAt: Date | null;
  permalink: string | null;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  plays: number;
  reach: number;
};

export type DashboardAnalytics = {
  kpis: {
    scheduledNext7: number;
    publishedLast7: number;
    publishedPrev7: number;
    needsReview: number;
    failed: number;
    reachLast7: number;
    engagementLast7: number;
    assetCount: number;
    accountCount: number;
    connectedCount: number;
    disabledCount: number;
  };
  activity: DayBucket[];
  pipeline: PipelineRow[];
  platformMix: { platform: Platform; queued: number; published: number }[];
  accounts: AccountCard[];
  brands: BrandCard[];
  activityFeed: ActivityItem[];
  upcoming: UpcomingItem[];
  topPosts: TopPost[];
  todayPlan: UpcomingItem[];
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** IST calendar day for a timestamp, as YYYY-MM-DD (the studio's working day). */
export function istDayKey(date: Date): string {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Midnight IST today, as a UTC instant — the boundary every "today" query uses. */
export function startOfIstDay(now = new Date()): Date {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}

function dayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", timeZone: "UTC" });
}

const STATE_LABELS: Record<PostState, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  approved: "Approved",
  queued: "Queued",
  publishing: "Publishing",
  posted: "Published",
  partially_failed: "Partly failed",
  failed: "Failed",
};

const STATE_TONES: Record<PostState, string> = {
  draft: "slate",
  needs_review: "amber",
  approved: "indigo",
  queued: "indigo",
  publishing: "sky",
  posted: "emerald",
  partially_failed: "orange",
  failed: "rose",
};

export async function dashboardAnalytics(dayCount = 14): Promise<DashboardAnalytics> {
  const db = await getDb();
  const now = new Date();
  const since7 = new Date(now.getTime() - 7 * 864e5);
  const since14 = new Date(now.getTime() - 14 * 864e5);
  const since30 = new Date(now.getTime() - 30 * 864e5);
  const until7 = new Date(now.getTime() + 7 * 864e5);
  const todayStart = startOfIstDay(now);
  const todayEnd = new Date(todayStart.getTime() + 864e5);

  // ── headline numbers ──────────────────────────────────────────────────────
  const [scheduledNext7] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(postTargets)
    .where(and(inArray(postTargets.state, ["queued", "approved"]), gte(postTargets.scheduledAt, now), lte(postTargets.scheduledAt, until7)));

  const [published7] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(postTargets)
    .where(and(eq(postTargets.state, "posted"), gte(postTargets.publishedAt, since7)));
  const [publishedPrev7] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(postTargets)
    .where(and(eq(postTargets.state, "posted"), gte(postTargets.publishedAt, since14), lt(postTargets.publishedAt, since7)));

  const [reviewCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(posts)
    .where(eq(posts.state, "needs_review"));
  const [failedCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(postTargets)
    .where(inArray(postTargets.state, ["failed"]));

  const [metrics7] = await db
    .select({
      reach: sql<number>`coalesce(sum(${metricsPost.reach}), 0)::int`,
      engagement: sql<number>`coalesce(sum(${metricsPost.likes} + ${metricsPost.comments} + ${metricsPost.saves} + ${metricsPost.shares}), 0)::int`,
    })
    .from(metricsPost)
    .where(gte(metricsPost.date, istDayKey(since7)));

  const [assetCount] = await db.select({ n: sql<number>`count(*)::int` }).from(assets);
  const [accountStats] = await db
    .select({
      // Disabled accounts are kept for their history but must never appear as
      // something the studio will publish to.
      total: sql<number>`count(*) filter (where ${accounts.status} <> 'disabled')::int`,
      connected: sql<number>`count(*) filter (where ${accounts.status} = 'connected')::int`.as("connected_count"),
      disabled: sql<number>`count(*) filter (where ${accounts.status} = 'disabled')::int`,
    })
    .from(accounts);

  // ── 14-day activity: scheduled vs published, bucketed in IST ─────────────
  const scheduledRows = await db
    .select({ at: postTargets.scheduledAt })
    .from(postTargets)
    .where(and(isNotNull(postTargets.scheduledAt), gte(postTargets.scheduledAt, new Date(now.getTime() - (dayCount - 1) * 864e5))));
  const publishedRows = await db
    .select({ at: postTargets.publishedAt })
    .from(postTargets)
    .where(and(isNotNull(postTargets.publishedAt), gte(postTargets.publishedAt, new Date(now.getTime() - (dayCount - 1) * 864e5))));

  const buckets = new Map<string, DayBucket>();
  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const date = istDayKey(new Date(now.getTime() - i * 864e5));
    buckets.set(date, { date, label: dayLabel(date), scheduled: 0, published: 0 });
  }
  for (const row of scheduledRows) {
    if (!row.at) continue;
    const bucket = buckets.get(istDayKey(row.at));
    if (bucket) bucket.scheduled += 1;
  }
  for (const row of publishedRows) {
    if (!row.at) continue;
    const bucket = buckets.get(istDayKey(row.at));
    if (bucket) bucket.published += 1;
  }

  // ── pipeline ──────────────────────────────────────────────────────────────
  const pipelineRows = await db
    .select({ state: posts.state, n: sql<number>`count(*)::int` })
    .from(posts)
    .groupBy(posts.state);
  const pipelineCounts = new Map(pipelineRows.map((row) => [row.state, Number(row.n)]));
  const pipeline: PipelineRow[] = (Object.keys(STATE_LABELS) as PostState[]).map((state) => ({
    state,
    label: STATE_LABELS[state],
    count: pipelineCounts.get(state) ?? 0,
    tone: STATE_TONES[state],
  }));

  // ── platform mix ──────────────────────────────────────────────────────────
  const mixRows = await db
    .select({
      platform: postTargets.platform,
      queued: sql<number>`count(*) filter (where ${postTargets.state} in ('queued','approved','publishing'))::int`,
      published: sql<number>`count(*) filter (where ${postTargets.state} = 'posted')::int`,
    })
    .from(postTargets)
    .groupBy(postTargets.platform);

  // ── per-account health ────────────────────────────────────────────────────
  const accountRows = await db
    .select({
      id: accounts.id,
      platform: accounts.platform,
      handle: accounts.handle,
      displayName: accounts.displayName,
      status: accounts.status,
      dailyCap: accounts.dailyCap,
      expiresAt: accounts.expiresAt,
      lastError: accounts.lastError,
      brandName: brands.name,
      postedToday: sql<number>`(
        select count(*)::int from ${postTargets} t
        where t.account_id = ${accounts.id} and t.state = 'posted' and t.published_at >= ${todayStart}
      )`,
      queuedCount: sql<number>`(
        select count(*)::int from ${postTargets} t
        where t.account_id = ${accounts.id} and t.state in ('queued','approved','publishing')
      )`,
      nextRunAt: sql<Date | null>`(
        select min(t.scheduled_at) from ${postTargets} t
        where t.account_id = ${accounts.id} and t.state in ('queued','approved','publishing') and t.scheduled_at >= ${now}
      )`,
    })
    .from(accounts)
    .leftJoin(brands, eq(accounts.brandId, brands.id))
    .where(sql`${accounts.status} <> 'disabled'`)
    .orderBy(accounts.platform, accounts.handle);

  const accountCards: AccountCard[] = accountRows.map((row) => {
    const expires = row.expiresAt ? new Date(row.expiresAt) : null;
    return {
      id: row.id,
      platform: row.platform as Platform,
      handle: row.handle || row.displayName || row.id.slice(0, 8),
      displayName: row.displayName,
      brandName: row.brandName ?? "Unassigned",
      status: row.status,
      dailyCap: row.dailyCap,
      postedToday: Number(row.postedToday ?? 0),
      queuedCount: Number(row.queuedCount ?? 0),
      nextRunAt: row.nextRunAt ? new Date(row.nextRunAt) : null,
      lastError: row.lastError,
      tokenExpiresAt: expires,
      tokenDaysLeft: expires ? Math.floor((expires.getTime() - now.getTime()) / 864e5) : null,
    };
  });

  // ── brands ────────────────────────────────────────────────────────────────
  const brandRows = await db.select().from(brands).orderBy(brands.name);
  const brandStats = await db
    .select({
      brandId: posts.brandId,
      state: posts.state,
      n: sql<number>`count(*)::int`,
    })
    .from(posts)
    .groupBy(posts.brandId, posts.state);

  const reachRows = await db
    .select({
      brandId: posts.brandId,
      reach: sql<number>`coalesce(sum(${metricsPost.reach}), 0)::int`,
      published: sql<number>`count(*)::int`,
    })
    .from(metricsPost)
    .innerJoin(postTargets, eq(metricsPost.postTargetId, postTargets.id))
    .innerJoin(posts, eq(postTargets.postId, posts.id))
    .where(gte(metricsPost.date, istDayKey(since30)))
    .groupBy(posts.brandId);

  const brandCards: BrandCard[] = brandRows.map((brand) => {
    const stats = brandStats.filter((row) => row.brandId === brand.id);
    const reach = reachRows.find((row) => row.brandId === brand.id);
    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      colorHex: firstColor(brand.colors),
      scheduled: stats.filter((row) => ["queued", "approved", "publishing"].includes(row.state)).reduce((sum, row) => sum + Number(row.n), 0),
      needsReview: stats.filter((row) => row.state === "needs_review").reduce((sum, row) => sum + Number(row.n), 0),
      published30: Number(reach?.published ?? 0),
      reach30: Number(reach?.reach ?? 0),
      pillars: brand.pillars ?? [],
    };
  });

  // ── what is going out today, and next ─────────────────────────────────────
  const upcomingRows = await db
    .select({
      postId: posts.id,
      title: posts.title,
      brandName: brands.name,
      platform: postTargets.platform,
      mediaType: postTargets.mediaType,
      scheduledAt: postTargets.scheduledAt,
      state: postTargets.state,
    })
    .from(postTargets)
    .innerJoin(posts, eq(postTargets.postId, posts.id))
    .leftJoin(brands, eq(posts.brandId, brands.id))
    .where(and(inArray(postTargets.state, ["queued", "approved", "publishing"]), gte(postTargets.scheduledAt, now)))
    .orderBy(postTargets.scheduledAt)
    .limit(12);

  const upcoming: UpcomingItem[] = upcomingRows.map((row) => ({
    postId: row.postId,
    title: row.title || "(untitled)",
    brandName: row.brandName ?? "Unassigned",
    platform: row.platform as Platform,
    mediaType: row.mediaType as MediaType,
    scheduledAt: row.scheduledAt ? new Date(row.scheduledAt) : null,
    state: row.state as TargetState,
  }));

  const todayRows = await db
    .select({
      postId: posts.id,
      title: posts.title,
      brandName: brands.name,
      platform: postTargets.platform,
      mediaType: postTargets.mediaType,
      scheduledAt: postTargets.scheduledAt,
      state: postTargets.state,
    })
    .from(postTargets)
    .innerJoin(posts, eq(postTargets.postId, posts.id))
    .leftJoin(brands, eq(posts.brandId, brands.id))
    .where(
      and(
        inArray(postTargets.state, ["queued", "approved", "publishing", "posted", "failed"]),
        gte(postTargets.scheduledAt, todayStart),
        lt(postTargets.scheduledAt, todayEnd),
      ),
    )
    .orderBy(postTargets.scheduledAt);

  const todayPlan: UpcomingItem[] = todayRows.map((row) => ({
    postId: row.postId,
    title: row.title || "(untitled)",
    brandName: row.brandName ?? "Unassigned",
    platform: row.platform as Platform,
    mediaType: row.mediaType as MediaType,
    scheduledAt: row.scheduledAt ? new Date(row.scheduledAt) : null,
    state: row.state as TargetState,
  }));

  // ── best performing posts (last 30 days) ─────────────────────────────────
  const topRows = await db
    .select({
      postId: posts.id,
      title: posts.title,
      platform: postTargets.platform,
      handle: accounts.handle,
      publishedAt: postTargets.publishedAt,
      permalink: postTargets.remoteUrl,
      likes: sql<number>`coalesce(sum(${metricsPost.likes}), 0)::int`,
      comments: sql<number>`coalesce(sum(${metricsPost.comments}), 0)::int`,
      saves: sql<number>`coalesce(sum(${metricsPost.saves}), 0)::int`,
      shares: sql<number>`coalesce(sum(${metricsPost.shares}), 0)::int`,
      plays: sql<number>`coalesce(sum(${metricsPost.plays}), 0)::int`,
      reach: sql<number>`coalesce(sum(${metricsPost.reach}), 0)::int`,
    })
    .from(postTargets)
    .innerJoin(posts, eq(postTargets.postId, posts.id))
    .leftJoin(accounts, eq(postTargets.accountId, accounts.id))
    .leftJoin(metricsPost, eq(metricsPost.postTargetId, postTargets.id))
    .where(and(eq(postTargets.state, "posted"), gte(postTargets.publishedAt, since30)))
    .groupBy(posts.id, posts.title, postTargets.platform, accounts.handle, postTargets.publishedAt, postTargets.remoteUrl)
    .orderBy(desc(sql`coalesce(sum(${metricsPost.reach}), 0)`))
    .limit(5);

  const topPosts: TopPost[] = topRows.map((row) => ({
    postId: row.postId,
    title: row.title || "(untitled)",
    platform: row.platform as Platform,
    handle: row.handle ?? "",
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
    permalink: row.permalink,
    likes: Number(row.likes ?? 0),
    comments: Number(row.comments ?? 0),
    saves: Number(row.saves ?? 0),
    shares: Number(row.shares ?? 0),
    plays: Number(row.plays ?? 0),
    reach: Number(row.reach ?? 0),
  }));

  // ── activity feed ─────────────────────────────────────────────────────────
  const eventRows = await db.select().from(events).orderBy(desc(events.at)).limit(14);
  const activityFeed: ActivityItem[] = eventRows.map((row) => ({
    at: new Date(row.at),
    type: row.type,
    actor: row.actor,
    subject: row.subject,
    summary: summariseEvent(row.type, row.payload as Record<string, unknown>),
    tone: eventTone(row.type),
  }));

  return {
    kpis: {
      scheduledNext7: Number(scheduledNext7?.n ?? 0),
      publishedLast7: Number(published7?.n ?? 0),
      publishedPrev7: Number(publishedPrev7?.n ?? 0),
      needsReview: Number(reviewCount?.n ?? 0),
      failed: Number(failedCount?.n ?? 0),
      reachLast7: Number(metrics7?.reach ?? 0),
      engagementLast7: Number(metrics7?.engagement ?? 0),
      assetCount: Number(assetCount?.n ?? 0),
      accountCount: Number(accountStats?.total ?? 0),
      connectedCount: Number(accountStats?.connected ?? 0),
      disabledCount: Number(accountStats?.disabled ?? 0),
    },
    activity: [...buckets.values()],
    pipeline,
    platformMix: (mixRows.length ? mixRows : [{ platform: "instagram" as Platform, queued: 0, published: 0 }]).map((row) => ({
      platform: row.platform as Platform,
      queued: Number(row.queued ?? 0),
      published: Number(row.published ?? 0),
    })),
    accounts: accountCards,
    brands: brandCards,
    activityFeed,
    upcoming,
    topPosts,
    todayPlan,
  };
}

/** Brands carry a colour map; the dashboard wants one swatch. */
function firstColor(colors: Record<string, string> | null | undefined): string | null {
  if (!colors) return null;
  const values = Object.values(colors).filter((value) => typeof value === "string");
  return values[0] ?? null;
}

/** Turn an audit event into one readable line — the feed is for humans. */
function summariseEvent(type: string, payload: Record<string, unknown>): string {
  const handle = typeof payload.handle === "string" ? payload.handle : null;
  const platform = typeof payload.platform === "string" ? payload.platform : null;
  const title = typeof payload.title === "string" ? payload.title : null;

  switch (type) {
    case "post.created":
      return title ? `Post created — ${title}` : "Post created";
    case "post.approved":
      return title ? `Approved — ${title}` : "Post approved";
    case "post.state":
      return typeof payload.state === "string" ? `Post moved to ${String(payload.state).replace(/_/g, " ")}` : "Post state changed";
    case "account.connected":
      return `Connected ${platform ?? "account"}${handle ? ` ${handle}` : ""}`;
    case "oauth.completed":
      return `Signed in to ${platform ?? "platform"}${handle ? ` as ${handle}` : ""}`;
    case "oauth.mock_connected":
      return `Connected a mock ${platform ?? "account"}`;
    case "account.disconnected":
      return "Account disconnected";
    case "account.status":
      return typeof payload.status === "string" ? `Account marked ${payload.status}` : "Account status changed";
    case "asset.created":
      return typeof payload.fileName === "string" ? `Media added — ${payload.fileName}` : "Media added";
    case "brand.created":
      return typeof payload.name === "string" ? `Brand created — ${payload.name}` : "Brand created";
    case "auth.login":
      return "Signed in";
    case "target.published":
      return handle ? `Published to ${handle}` : "Published";
    case "target.failed":
      return typeof payload.message === "string" ? `Publish failed — ${payload.message}` : "Publish failed";
    default:
      return type.replace(/[._]/g, " ");
  }
}

function eventTone(type: string): ActivityItem["tone"] {
  if (type.includes("failed")) return "danger";
  if (type.includes("connected") || type.includes("approved") || type === "target.published") return "success";
  if (type.includes("mock")) return "warning";
  if (type.startsWith("post") || type.startsWith("brand")) return "brand";
  return "neutral";
}

/** Posts that need a human decision, newest first — the dashboard's to-do list. */
export async function reviewQueue(limit = 6) {
  const db = await getDb();
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      caption: posts.captionMaster,
      brandName: brands.name,
      scheduledAt: posts.scheduledAt,
      createdAt: posts.createdAt,
      pillar: posts.pillar,
      targets: sql<number>`(select count(*)::int from ${postTargets} t where t.post_id = ${posts.id})`,
    })
    .from(posts)
    .leftJoin(brands, eq(posts.brandId, brands.id))
    .where(eq(posts.state, "needs_review"))
    .orderBy(posts.scheduledAt)
    .limit(limit);
  return rows.map((row) => ({
    id: row.id,
    title: row.title || "(untitled)",
    caption: row.caption,
    brandName: row.brandName ?? "Unassigned",
    scheduledAt: row.scheduledAt ? new Date(row.scheduledAt) : null,
    createdAt: new Date(row.createdAt),
    pillar: row.pillar,
    targetCount: Number(row.targets ?? 0),
  }));
}

/** Just the two numbers the sidebar badges need — cheap enough to run per render. */
export async function countPendingWork(): Promise<{ review: number; queue: number }> {
  const db = await getDb();
  const [review] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(posts)
    .where(eq(posts.state, "needs_review"));
  const [queued] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(postTargets)
    .where(inArray(postTargets.state, ["queued", "approved", "publishing"]));
  return { review: Number(review?.n ?? 0), queue: Number(queued?.n ?? 0) };
}
