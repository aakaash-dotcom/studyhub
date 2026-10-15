/**
 * Schema migrations, applied in order and tracked in `_migrations`.
 *
 * These are hand-authored SQL statements (Postgres dialect) that mirror
 * schema.ts 1:1. Keeping them as a TS module — rather than .sql files read at
 * runtime — means migrations work identically in the Next.js server, the
 * worker, and inside Docker where no extra files are copied.
 *
 * Rules: never edit an applied migration; append a new one.
 */

export type Migration = { name: string; sql: string };

const init = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_key ON sessions (token_hash);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_id uuid,
  prefix text NOT NULL,
  key_hash text NOT NULL,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS api_keys_hash_key ON api_keys (key_hash);

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  pillars jsonb NOT NULL DEFAULT '[]'::jsonb,
  tone_guide text NOT NULL DEFAULT '',
  hashtag_sets jsonb NOT NULL DEFAULT '{}'::jsonb,
  colors jsonb NOT NULL DEFAULT '{}'::jsonb,
  logo_url text,
  funnel_link text,
  target_audience text NOT NULL DEFAULT '',
  autopublish boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS brands_slug_key ON brands (slug);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  platform text NOT NULL,
  auth_path text NOT NULL,
  handle text NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  platform_account_id text NOT NULL,
  token_type text NOT NULL DEFAULT 'long_lived',
  access_token_enc text,
  refresh_token_enc text,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'connected',
  posting_windows jsonb NOT NULL DEFAULT '[]'::jsonb,
  daily_cap integer NOT NULL DEFAULT 10,
  language text NOT NULL DEFAULT 'ta',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  last_refresh_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS accounts_platform_account_key ON accounts (platform, platform_account_id);
CREATE INDEX IF NOT EXISTS accounts_brand_idx ON accounts (brand_id);

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'upload',
  drive_file_id text,
  file_name text NOT NULL DEFAULT '',
  mime_type text NOT NULL DEFAULT '',
  kind text NOT NULL,
  sha256 text,
  r2_key text,
  public_url text,
  probe jsonb,
  validation jsonb,
  width integer,
  height integer,
  duration_s real,
  bytes integer,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL DEFAULT 'human'
);
CREATE INDEX IF NOT EXISTS assets_created_idx ON assets (created_at);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  caption_master text NOT NULL DEFAULT '',
  hashtags jsonb NOT NULL DEFAULT '[]'::jsonb,
  pillar text,
  campaign_id text,
  scheduled_at timestamptz,
  state text NOT NULL DEFAULT 'draft',
  approval_source text,
  approved_by text,
  approved_at timestamptz,
  created_by text NOT NULL DEFAULT 'human',
  source_ref text,
  external_id text,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_state_sched_idx ON posts (state, scheduled_at);
CREATE UNIQUE INDEX IF NOT EXISTS posts_external_id_key ON posts (external_id);

CREATE TABLE IF NOT EXISTS post_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  platform text NOT NULL,
  media_type text NOT NULL,
  caption_override text,
  hashtags_override jsonb,
  share_to_feed boolean NOT NULL DEFAULT true,
  cover_url text,
  thumb_offset_ms integer,
  yt_title text,
  yt_desc text,
  yt_tags jsonb,
  yt_category text DEFAULT '27',
  yt_shorts boolean NOT NULL DEFAULT true,
  yt_privacy text NOT NULL DEFAULT 'private',
  state text NOT NULL DEFAULT 'draft',
  remote_id text,
  remote_url text,
  error_code text,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz,
  published_at timestamptz,
  metrics_fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_targets_post_idx ON post_targets (post_id);
CREATE INDEX IF NOT EXISTS post_targets_state_idx ON post_targets (state, scheduled_at);
CREATE UNIQUE INDEX IF NOT EXISTS post_targets_post_account_key ON post_targets (post_id, account_id);

CREATE TABLE IF NOT EXISTS post_assets (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS post_assets_key ON post_assets (post_id, asset_id);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_target_id uuid NOT NULL REFERENCES post_targets(id) ON DELETE CASCADE,
  run_at timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  locked_by text,
  locked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jobs_state_run_idx ON jobs (state, run_at);
CREATE UNIQUE INDEX IF NOT EXISTS jobs_target_key ON jobs (post_target_id);

CREATE TABLE IF NOT EXISTS metrics_post (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_target_id uuid NOT NULL REFERENCES post_targets(id) ON DELETE CASCADE,
  date text NOT NULL,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  saves integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0,
  plays integer NOT NULL DEFAULT 0,
  watch_time_s integer NOT NULL DEFAULT 0,
  avg_view_pct real,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS metrics_post_key ON metrics_post (post_target_id, date);

CREATE TABLE IF NOT EXISTS metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  date text NOT NULL,
  followers integer NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  profile_views integer NOT NULL DEFAULT 0,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS metrics_daily_key ON metrics_daily (account_id, date);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL DEFAULT 'system',
  type text NOT NULL,
  subject text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS events_at_idx ON events (at);
CREATE INDEX IF NOT EXISTS events_type_idx ON events (type);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
`;

export const migrations: Migration[] = [{ name: "0001_init", sql: init }];
