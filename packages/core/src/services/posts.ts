import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { accounts, assets, jobs, postAssets, postTargets, posts } from "../db/schema";
import { recordEvent, type EventActor } from "../audit";
import type { MediaType, Platform, PostState, TargetState } from "../constants";

export type Post = typeof posts.$inferSelect;
export type PostTarget = typeof postTargets.$inferSelect;
export type PostWithTargets = Post & { targets: Array<PostTarget & { account: { handle: string; platform: Platform } }> };

export type CreatePostInput = {
  brandId: string;
  title?: string;
  caption: string;
  hashtags?: string[];
  pillar?: string;
  assetIds?: string[];
  scheduledAt?: Date | null;
  state?: PostState;
  createdBy?: string;
  externalId?: string | null;
  sourceRef?: string | null;
  targets: Array<{
    accountId: string;
    mediaType: MediaType;
    captionOverride?: string | null;
    hashtagsOverride?: string[] | null;
    ytTitle?: string | null;
    ytDesc?: string | null;
    ytTags?: string[] | null;
    ytShorts?: boolean;
    shareToFeed?: boolean;
    coverUrl?: string | null;
  }>;
};

/**
 * Creates a post plus one target per account, and (when a time is given and the
 * post is already approved) one job per target.
 *
 * Idempotency: if `externalId` matches an existing post, that post is returned
 * untouched — this is what lets an agent retry a request safely (PLAN.md §6.3).
 */
export async function createPost(input: CreatePostInput): Promise<PostWithTargets> {
  const db = await getDb();

  if (input.externalId) {
    const existing = await db.select().from(posts).where(eq(posts.externalId, input.externalId)).limit(1);
    if (existing[0]) return getPostWithTargets(existing[0].id) as Promise<PostWithTargets>;
  }

  const [post] = await db
    .insert(posts)
    .values({
      brandId: input.brandId,
      title: input.title ?? "",
      captionMaster: input.caption,
      hashtags: input.hashtags ?? [],
      pillar: input.pillar ?? null,
      scheduledAt: input.scheduledAt ?? null,
      state: input.state ?? "draft",
      createdBy: input.createdBy ?? "human",
      externalId: input.externalId ?? null,
      sourceRef: input.sourceRef ?? null,
    })
    .returning();

  for (const target of input.targets) {
    const [row] = await db
      .insert(postTargets)
      .values({
        postId: post!.id,
        accountId: target.accountId,
        platform: (await platformOf(target.accountId)) ?? "instagram",
        mediaType: target.mediaType,
        captionOverride: target.captionOverride ?? null,
        hashtagsOverride: target.hashtagsOverride ?? null,
        ytTitle: target.ytTitle ?? null,
        ytDesc: target.ytDesc ?? null,
        ytTags: target.ytTags ?? null,
        ytShorts: target.ytShorts ?? true,
        shareToFeed: target.shareToFeed ?? true,
        coverUrl: target.coverUrl ?? null,
        state: input.scheduledAt ? "approved" : "draft",
        scheduledAt: input.scheduledAt ?? null,
      })
      .returning();
    if (input.scheduledAt && row) await upsertJob(row.id, input.scheduledAt);
  }

  if (input.assetIds?.length) {
    await db.insert(postAssets).values(
      input.assetIds.map((assetId, index) => ({ postId: post!.id, assetId, position: index })),
    );
  }

  await recordEvent({
    type: "post.created",
    actor: (input.createdBy?.startsWith("agent") ? `agent:${input.createdBy.split(":")[1] ?? "unknown"}` : "human:studio") as EventActor,
    subject: post!.id,
    payload: { targets: input.targets.length, scheduledAt: input.scheduledAt?.toISOString() ?? null },
  });

  return getPostWithTargets(post!.id) as Promise<PostWithTargets>;
}

async function platformOf(accountId: string): Promise<Platform | null> {
  const db = await getDb();
  const rows = await db.select({ platform: accounts.platform }).from(accounts).where(eq(accounts.id, accountId)).limit(1);
  return rows[0]?.platform ?? null;
}

/** One job per target; the unique index makes this safe to call repeatedly. */
export async function upsertJob(postTargetId: string, runAt: Date): Promise<void> {
  const db = await getDb();
  await db
    .insert(jobs)
    .values({ postTargetId, runAt, state: "pending" })
    .onConflictDoUpdate({
      target: jobs.postTargetId,
      set: { runAt, state: "pending", lastError: null, updatedAt: new Date() },
    });
}

export async function getPostWithTargets(id: string): Promise<PostWithTargets | null> {
  const db = await getDb();
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return null;
  const targetRows = await db
    .select({ target: postTargets, handle: accounts.handle, platform: accounts.platform })
    .from(postTargets)
    .innerJoin(accounts, eq(accounts.id, postTargets.accountId))
    .where(eq(postTargets.postId, id))
    .orderBy(asc(postTargets.createdAt));
  return {
    ...post,
    targets: targetRows.map((r) => ({ ...r.target, account: { handle: r.handle, platform: r.platform } })),
  };
}

export async function listPosts(input: { state?: PostState[]; limit?: number; from?: Date } = {}): Promise<Post[]> {
  const db = await getDb();
  const filters = [];
  if (input.state?.length) filters.push(inArray(posts.state, input.state));
  if (input.from) filters.push(gte(posts.scheduledAt, input.from));
  const rows = await db
    .select()
    .from(posts)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(asc(posts.scheduledAt), desc(posts.createdAt))
    .limit(input.limit ?? 50);
  return rows;
}

/** Approve → queue → create jobs. The single entry point for "make it go". */
export async function approvePost(id: string, actor: EventActor, source: "ui" | "whatsapp" | "notion" | "api"): Promise<void> {
  const db = await getDb();
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) throw new Error("Post not found");
  const when = post.scheduledAt ?? new Date(Date.now() + 5 * 60 * 1000);

  await db
    .update(posts)
    .set({ state: "queued", approvalSource: source, approvedBy: actor, approvedAt: new Date(), scheduledAt: when, updatedAt: new Date() })
    .where(eq(posts.id, id));
  await db
    .update(postTargets)
    .set({ state: "queued", scheduledAt: when, updatedAt: new Date() })
    .where(eq(postTargets.postId, id));

  const targets = await db.select({ id: postTargets.id }).from(postTargets).where(eq(postTargets.postId, id));
  for (const t of targets) await upsertJob(t.id, when);

  await recordEvent({ type: "post.approved", actor, subject: id, payload: { source, when: when.toISOString(), targets: targets.length } });
}

export async function setPostState(id: string, state: PostState, actor: EventActor, note?: string): Promise<void> {
  const db = await getDb();
  await db.update(posts).set({ state, updatedAt: new Date(), notes: note ?? undefined }).where(eq(posts.id, id));
  await db.update(postTargets).set({ state: state as unknown as TargetState, updatedAt: new Date() }).where(and(eq(postTargets.postId, id)));
  await recordEvent({ type: "post.state", actor, subject: id, payload: { state, note } });
}

export async function cancelPost(id: string, actor: EventActor): Promise<void> {
  const db = await getDb();
  await db
    .update(postTargets)
    .set({ state: "skipped", updatedAt: new Date() })
    .where(eq(postTargets.postId, id));
  await db
    .update(jobs)
    .set({ state: "cancelled", updatedAt: new Date() })
    .where(inArray(jobs.postTargetId, db.select({ id: postTargets.id }).from(postTargets).where(eq(postTargets.postId, id))));
  await setPostState(id, "draft", actor, "Cancelled by user");
}

export type QueueRow = {
  targetId: string;
  postId: string;
  title: string;
  platform: Platform;
  handle: string;
  mediaType: MediaType;
  state: TargetState;
  scheduledAt: Date | null;
  runAt: Date | null;
  attempt: number;
  errorMessage: string | null;
};

export async function listQueue(limit = 50): Promise<QueueRow[]> {
  const db = await getDb();
  const rows = await db
    .select({
      targetId: postTargets.id,
      postId: posts.id,
      title: posts.title,
      platform: postTargets.platform,
      handle: accounts.handle,
      mediaType: postTargets.mediaType,
      state: postTargets.state,
      scheduledAt: postTargets.scheduledAt,
      runAt: jobs.runAt,
      attempt: sql<number>`coalesce(${jobs.attempts}, 0)::int`,
      errorMessage: postTargets.errorMessage,
    })
    .from(postTargets)
    .innerJoin(posts, eq(posts.id, postTargets.postId))
    .innerJoin(accounts, eq(accounts.id, postTargets.accountId))
    .leftJoin(jobs, eq(jobs.postTargetId, postTargets.id))
    .orderBy(asc(sql`coalesce(${jobs.runAt}, ${postTargets.scheduledAt})`))
    .limit(limit);
  return rows;
}

export type DashboardStats = {
  accountCount: number;
  connectedCount: number;
  scheduledCount: number;
  needsReviewCount: number;
  postedLast7: number;
  failedCount: number;
  nextUp: QueueRow | null;
  assetsCount: number;
};

export async function dashboardStats(): Promise<DashboardStats> {
  const db = await getDb();
  const [accountStats] = await db
    .select({ total: count(), connected: sql<number>`count(*) filter (where ${accounts.status} = 'connected')` })
    .from(accounts);
  const [postStats] = await db
    .select({
      scheduled: sql<number>`count(*) filter (where ${posts.state} = 'queued')`,
      review: sql<number>`count(*) filter (where ${posts.state} = 'needs_review')`,
      failed: sql<number>`count(*) filter (where ${posts.state} in ('failed','partially_failed'))`,
    })
    .from(posts);
  const [metricStats] = await db.select({ total: count() }).from(assets);
  const postedRows = await db
    .select({ total: count() })
    .from(postTargets)
    .where(and(eq(postTargets.state, "posted"), gte(postTargets.publishedAt, new Date(Date.now() - 7 * 864e5))));

  const queue = await listQueue(20);
  const nextUp = queue.find((row) => ["queued", "approved", "publishing"].includes(row.state)) ?? null;

  return {
    accountCount: Number(accountStats?.total ?? 0),
    connectedCount: Number(accountStats?.connected ?? 0),
    scheduledCount: Number(postStats?.scheduled ?? 0),
    needsReviewCount: Number(postStats?.review ?? 0),
    postedLast7: Number(postedRows[0]?.total ?? 0),
    failedCount: Number(postStats?.failed ?? 0),
    nextUp,
    assetsCount: Number(metricStats?.total ?? 0),
  };
}
