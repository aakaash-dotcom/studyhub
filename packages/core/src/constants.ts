/**
 * Platform vocabulary. Everything else in the app refers to these unions so a
 * typo becomes a type error instead of a 3am production surprise.
 */

export const PLATFORMS = ["instagram", "facebook", "youtube"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const MEDIA_TYPES = ["REEL", "IMAGE", "CAROUSEL", "STORY", "VIDEO", "SHORT"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

/** What a platform target can be doing. Mirrors PLAN.md §5. */
export const TARGET_STATES = [
  "draft",
  "needs_review",
  "approved",
  "queued",
  "publishing",
  "posted",
  "failed",
  "skipped",
] as const;
export type TargetState = (typeof TARGET_STATES)[number];

export const POST_STATES = [
  "draft",
  "needs_review",
  "approved",
  "queued",
  "publishing",
  "posted",
  "partially_failed",
  "failed",
] as const;
export type PostState = (typeof POST_STATES)[number];

export const ACCOUNT_STATES = ["connected", "needs_reauth", "disabled"] as const;
export type AccountState = (typeof ACCOUNT_STATES)[number];

/** Instagram auth paths (PLAN.md §2.2). Both are stored per account. */
export const AUTH_PATHS = ["instagram_login", "facebook_login", "google"] as const;
export type AuthPath = (typeof AUTH_PATHS)[number];

export const JOB_STATES = ["pending", "running", "done", "failed", "cancelled"] as const;
export type JobState = (typeof JOB_STATES)[number];

export const ASSET_SOURCES = ["upload", "drive", "generated", "url"] as const;
export type AssetSource = (typeof ASSET_SOURCES)[number];

/** Which platform+media combinations the app will actually attempt. */
export const SUPPORTED_TARGETS: Record<Platform, readonly MediaType[]> = {
  instagram: ["REEL", "IMAGE", "CAROUSEL", "STORY"],
  facebook: ["VIDEO", "IMAGE"],
  youtube: ["VIDEO", "SHORT"],
};

/** Human labels for the UI (light theme, plain English, no jargon). */
export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook Page",
  youtube: "YouTube",
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  REEL: "Reel",
  IMAGE: "Image post",
  CAROUSEL: "Carousel",
  STORY: "Story",
  VIDEO: "Video",
  SHORT: "Short",
};

export const TARGET_STATE_LABELS: Record<TargetState, string> = {
  draft: "Draft",
  needs_review: "Needs review",
  approved: "Approved",
  queued: "Queued",
  publishing: "Publishing",
  posted: "Posted",
  failed: "Failed",
  skipped: "Skipped",
};

/** Posting windows are stored as "HH:MM-HH:MM" strings in the account timezone. */
export const DEFAULT_POSTING_WINDOWS = ["07:00-09:00", "16:00-18:00", "20:30-22:00"];

/**
 * YouTube category ids we care about.
 * 27 = Education, 28 = Science & Technology, 22 = People & Blogs
 */
export const YOUTUBE_CATEGORIES = {
  education: "27",
  science: "28",
  people: "22",
} as const;

export const DEFAULT_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_LANGUAGE = "ta";
