import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  AccountState,
  AssetSource,
  AuthPath,
  JobState,
  MediaType,
  Platform,
  PostState,
  TargetState,
} from "../constants";

/**
 * Centum Studio schema v1 — see PLAN.md §5.
 *
 * Conventions
 *  - ids are uuid v4 (gen_random_uuid(), built into Postgres 13+)
 *  - timestamps are timestamptz
 *  - "state" columns are text + TS union types (readable in SQL, easy to extend)
 *  - tokens are stored ONLY as ciphertext (see ../crypto.ts)
 */

// ── auth ────────────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull().default(""),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("owner"), // owner | staff
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_email_key").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [uniqueIndex("sessions_token_key").on(t.tokenHash), index("sessions_user_idx").on(t.userId)],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    brandId: uuid("brand_id"), // null = all brands
    prefix: text("prefix").notNull(), // shown in the UI, e.g. "sk_live_a1b2"
    keyHash: text("key_hash").notNull(),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("api_keys_hash_key").on(t.keyHash)],
);

// ── brand & accounts ────────────────────────────────────────────────────────
export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    pillars: jsonb("pillars").$type<string[]>().notNull().default([]),
    toneGuide: text("tone_guide").notNull().default(""),
    hashtagSets: jsonb("hashtag_sets").$type<Record<string, string[]>>().notNull().default({}),
    colors: jsonb("colors").$type<Record<string, string>>().notNull().default({}),
    logoUrl: text("logo_url"),
    funnelLink: text("funnel_link"),
    targetAudience: text("target_audience").notNull().default(""),
    autopublish: boolean("autopublish").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("brands_slug_key").on(t.slug)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
    platform: text("platform").$type<Platform>().notNull(),
    authPath: text("auth_path").$type<AuthPath>().notNull(),
    handle: text("handle").notNull().default(""),
    displayName: text("display_name").notNull().default(""),
    platformAccountId: text("platform_account_id").notNull(),
    tokenType: text("token_type").notNull().default("long_lived"),
    accessTokenEnc: text("access_token_enc"), // ciphertext only
    refreshTokenEnc: text("refresh_token_enc"),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: text("status").$type<AccountState>().notNull().default("connected"),
    postingWindows: jsonb("posting_windows").$type<string[]>().notNull().default([]),
    dailyCap: integer("daily_cap").notNull().default(10),
    language: text("language").notNull().default("ta"),
    timezone: text("timezone").notNull().default("Asia/Kolkata"),
    lastRefreshAt: timestamp("last_refresh_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("accounts_platform_account_key").on(t.platform, t.platformAccountId),
    index("accounts_brand_idx").on(t.brandId),
  ],
);

// ── media ───────────────────────────────────────────────────────────────────
export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").$type<AssetSource>().notNull().default("upload"),
    driveFileId: text("drive_file_id"),
    fileName: text("file_name").notNull().default(""),
    mimeType: text("mime_type").notNull().default(""),
    kind: text("kind").$type<"image" | "video">().notNull(),
    sha256: text("sha256"),
    r2Key: text("r2_key"),
    publicUrl: text("public_url"),
    probe: jsonb("probe").$type<Record<string, unknown>>(),
    validation: jsonb("validation").$type<{ ok: boolean; issues: string[]; warnings: string[] }>(),
    width: integer("width"),
    height: integer("height"),
    durationS: real("duration_s"),
    bytes: integer("bytes"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: text("created_by").notNull().default("human"),
  },
  (t) => [index("assets_created_idx").on(t.createdAt)],
);

// ── content ─────────────────────────────────────────────────────────────────
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
    title: text("title").notNull().default(""),
    captionMaster: text("caption_master").notNull().default(""),
    hashtags: jsonb("hashtags").$type<string[]>().notNull().default([]),
    pillar: text("pillar"),
    campaignId: text("campaign_id"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    state: text("state").$type<PostState>().notNull().default("draft"),
    approvalSource: text("approval_source").$type<"ui" | "whatsapp" | "notion" | "api">(),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdBy: text("created_by").notNull().default("human"), // human | agent:<name>
    sourceRef: text("source_ref"), // notion page id / drive file id / api client
    externalId: text("external_id"), // idempotency key from agents
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("posts_state_sched_idx").on(t.state, t.scheduledAt),
    uniqueIndex("posts_external_id_key").on(t.externalId),
  ],
);

export const postTargets = pgTable(
  "post_targets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    platform: text("platform").$type<Platform>().notNull(),
    mediaType: text("media_type").$type<MediaType>().notNull(),
    captionOverride: text("caption_override"),
    hashtagsOverride: jsonb("hashtags_override").$type<string[]>(),
    // instagram-specific
    shareToFeed: boolean("share_to_feed").notNull().default(true),
    coverUrl: text("cover_url"),
    thumbOffsetMs: integer("thumb_offset_ms"),
    // youtube-specific
    ytTitle: text("yt_title"),
    ytDesc: text("yt_desc"),
    ytTags: jsonb("yt_tags").$type<string[]>(),
    ytCategory: text("yt_category").default("27"), // Education
    ytShorts: boolean("yt_shorts").notNull().default(true),
    ytPrivacy: text("yt_privacy").notNull().default("private"), // private until audit passes
    // lifecycle
    state: text("state").$type<TargetState>().notNull().default("draft"),
    remoteId: text("remote_id"),
    remoteUrl: text("remote_url"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    attempts: integer("attempts").notNull().default(0),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    metricsFetchedAt: timestamp("metrics_fetched_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("post_targets_post_idx").on(t.postId),
    index("post_targets_state_idx").on(t.state, t.scheduledAt),
    uniqueIndex("post_targets_post_account_key").on(t.postId, t.accountId),
  ],
);

export const postAssets = pgTable(
  "post_assets",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [uniqueIndex("post_assets_key").on(t.postId, t.assetId)],
);

// ── queue ───────────────────────────────────────────────────────────────────
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postTargetId: uuid("post_target_id")
      .notNull()
      .references(() => postTargets.id, { onDelete: "cascade" }),
    runAt: timestamp("run_at", { withTimezone: true }).notNull(),
    state: text("state").$type<JobState>().notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(3),
    lockedBy: text("locked_by"),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("jobs_state_run_idx").on(t.state, t.runAt),
    uniqueIndex("jobs_target_key").on(t.postTargetId), // one job per target => no double posts
  ],
);

// ── metrics & audit ─────────────────────────────────────────────────────────
export const metricsPost = pgTable(
  "metrics_post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postTargetId: uuid("post_target_id")
      .notNull()
      .references(() => postTargets.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    saves: integer("saves").notNull().default(0),
    shares: integer("shares").notNull().default(0),
    reach: integer("reach").notNull().default(0),
    plays: integer("plays").notNull().default(0),
    watchTimeS: integer("watch_time_s").notNull().default(0),
    avgViewPct: real("avg_view_pct"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("metrics_post_key").on(t.postTargetId, t.date)],
);

export const metricsDaily = pgTable(
  "metrics_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    followers: integer("followers").notNull().default(0),
    reach: integer("reach").notNull().default(0),
    impressions: integer("impressions").notNull().default(0),
    profileViews: integer("profile_views").notNull().default(0),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("metrics_daily_key").on(t.accountId, t.date)],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actor: text("actor").notNull().default("system"), // human:ravi | agent:claude | system
    type: text("type").notNull(),
    subject: text("subject"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  },
  (t) => [index("events_at_idx").on(t.at), index("events_type_idx").on(t.type)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  users,
  sessions,
  apiKeys,
  brands,
  accounts,
  assets,
  posts,
  postTargets,
  postAssets,
  jobs,
  metricsPost,
  metricsDaily,
  events,
  settings,
};
