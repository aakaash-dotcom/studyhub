# CENTUM STUDIO — Build Plan

Companion to `PLAN.md`. This is the *how*: capability, stack, sprint order, credential checklist, risks, definition of done.

---

## §A. Can I build this myself? (your question, answered honestly)

**Yes. I write 100 % of the code — schema, providers, worker, dashboard, API, tests — in this repo, and I can run the whole app here and hand you a live preview link in the browser so you can click through it while I work.**

What I can do in this sandbox:

| ✅ I can | |
|---|---|
| Write every line of the app, refactor it, keep it consistent across months of work | Delete/archive the old app and scaffold the new repo |
| Install dependencies, run migrations, run tests, run the dev server and preview it for you | Build the whole publish pipeline against **mock platform providers** so the UI and logic are real — then flip a config flag to hit the real Meta/YouTube APIs |
| Design the exact payloads for Instagram/YouTube calls, error taxonomies and quota logic | Write your credential checklists, runbooks and audit-prep docs |

What I **cannot** do (nobody can, on your behalf):

| ❌ Only you can | Why |
|---|---|
| Create the Meta app, add pages as Instagram Testers, accept the invites | These are *your* logins and *your* pages — the whole point of the setup is that the accounts are yours |
| Create the Google Cloud project, click through OAuth consent, submit the YouTube audit form | Same. The audit also describes *your* app, and I can draft every answer and the demo-video script for you |
| Serve OAuth callbacks from this sandbox | Callback URLs must be HTTPS URLs on a domain you own; I'll give you the exact `docker compose up` deployment so callbacks work there |
| Keep a server running 24×7 for you | The sandbox isn't production; deployment is a one-command step you run (or I walk you through) on your VPS |

**On asking Z/GLM/other models to build it instead:** you *can* — any competent model can generate a CRUD app. What it will not give you is the part that actually decides whether this project works: the **platform rules** (Development-Mode Instagram publishing, the YouTube private-lock trap, the R2 media-fetch requirement, quota semantics, token lifecycles), the **error taxonomy**, the **guardrails** for running a matrix of pages safely, and the **single service layer** that makes the human app and the agent layer the same system. Those are decisions, not code volume — and they're already written down in these two documents, so any model (including me) has the same instruction set. My honest recommendation: **let me build it here, keep this repo as the single source of truth, and bring in another model only for isolated, well-specified pieces** (e.g. "write 30 Remotion templates in this exact JSON contract") — never to own the core.

**Speed expectation:** with the credentials ready, a *usable* human app (login → connect → media → compose → schedule → Instagram Reel + YouTube Short publish → WhatsApp approval) is roughly **8 sprints** of work as listed below. You'll be able to click a live preview after Sprint 1, and post for real as soon as your Meta/Google credentials exist (Sprint 4–5).

---

## §B. Stack (and why)

| Layer | Choice | Why this one |
|---|---|---|
| Language | **TypeScript** everywhere | One language for UI, API, worker, and the agent SDK; Zod types shared end-to-end |
| Dashboard | **Next.js 15 (App Router) + React 19 + Tailwind + shadcn/ui** | One codebase for UI + HTTP API; fast to build a professional-looking dashboard; I can run and preview it in this sandbox |
| Database | **PostgreSQL 16** in production, **PGlite/SQLite** in dev | Real `SELECT … FOR UPDATE SKIP LOCKED` queue in prod; zero-dependency dev DB so the sandbox works without Docker |
| ORM/migrations | **Drizzle ORM** | Typed schema-as-code, plain SQL migrations, the same code runs on PGlite and Postgres |
| Worker | **Node + `tsx`** long-running process | Timers, ffmpeg child processes and 300 MB uploads are all trivial in a normal process; no serverless timeouts |
| Queue | **Postgres `jobs` table** | No Redis/Temporal needed at your volume; idempotency and retries are plain rows you can inspect in the UI |
| Media | **ffmpeg + ffprobe**, **Cloudflare R2** via the S3 SDK | One master transcode (1080×1920, H.264+AAC, faststart); R2 gives zero-egress public URLs Meta/YouTube can fetch |
| Auth | **Session cookie + Postgres sessions** (single user first, roles table present) | Boring, secure, no vendor |
| Validation | **Zod** schemas used by the dashboard, REST API *and* MCP tools | Impossible for the agent path to bypass human validation — one definition |
| Notifications | **`notifier` interface → your WhatsApp CRM REST adapter** | Swap providers in one file; CRM down ≠ publishing down |
| Observability | **pino** logs + append-only `events` table + a Failures screen | A 3 am failure must be diagnosable at breakfast |
| Tests | **Vitest** (unit + golden-JSON provider tests) + a **local fake Meta/YouTube server** | Provider payloads are verified against recorded fixtures before you ever spend a real quota unit |
| Deploy | **Docker Compose** (studio · worker · postgres · caddy) | One command, HTTPS via Caddy, nightly `pg_dump` to R2 |

**Deliberately rejected:** NestJS (too much ceremony for this size), Python/DRF (two languages, no gain), Supabase-as-backend (couples scheduling to a vendor), n8n as the core (great *client*, terrible place to hide error handling and quota logic), Temporal (solves problems you don't have yet).

---

## §C. Repository layout

```
studyhub/
├─ PLAN.md · BUILD_PLAN.md · README.md
├─ docker-compose.yml · Caddyfile · .env.example
├─ apps/
│  ├─ studio/            Next.js: dashboard UI + API routes + OAuth callbacks + webhooks
│  │   ├─ app/(dash)/    dashboard · accounts · compose · calendar · queue · media · settings
│  │   ├─ app/api/       /api/oauth/* · /api/v1/* · /api/webhooks/*
│  │   └─ components/    composer, previews, calendar, tables
│  └─ worker/            scheduler loop · publisher workers · media box · insights · digests
├─ packages/
│  ├─ core/              db schema + migrations · job engine · quota · guardrails · audit
│  ├─ providers/         instagram/ · facebook/ · youtube/ · mock/   (one adapter each)
│  ├─ media/             drive.ts · r2.ts · ffmpeg.ts · validate.ts
│  ├─ notify/            notifier.ts (interface) · whatsapp-crm.ts (adapter)
│  ├─ notion/            P2 calendar sync
│  └─ render/            P3 Remotion templates + generators
├─ docs/                 setup/*.md · platform/*.md · runbook.md · audit-prep.md
├─ scripts/              seed.ts · backup.sh · restore.md · smoke-test.ts
└─ legacy/               archived old app (catalogue.json kept for P3)
```

---

## §D. Phase 1 build order — sprints, each with a hard exit test

**S1 · Foundation — DONE** ✅
**Decision (user, this session): no login page.** The studio is a single-operator
tool; a login wall protected nothing and cost a cookie, a session lookup and a
redirect on every request — and a cross-site iframe made that cookie genuinely
hard to keep. The app now runs as its owner (`packages/core/src/auth/owner.ts`),
and `npm run smoke:app` fails if a redirect to a login screen ever returns. What
stays protected: Phase 2 agent API keys, and the edge gate on the VPS (Caddy basic
auth / Tailscale — see README).
Scaffold monorepo, env handling, Drizzle schema v1 + migrations, PGlite dev DB, session auth, app shell + empty screens, logging, `events` audit table, `.env.example`, README, CI-less `npm run verify` (typecheck + tests). Seven screens render with real data; 20 tests green. *(docker-compose moves to the deployment sprint, S8.)*
*Exit:* app boots here, you see the dashboard in a live preview. **Met** — plus the sign-in loop fix: auth is now plain HTTP routes (`/api/auth/*`), cookies are `SameSite=None; Secure` over https so they survive the cross-site preview iframe, and `npm run smoke:login` proves it.

**S2 · Brands, accounts, OAuth — CODE DONE, awaiting your credentials for live** ✅
Brand CRUD. Accounts list. OAuth start/callback routes for **Instagram Login** and **Google/YouTube**; Instagram's three-host dance (www → api → graph) with the short→60-day token exchange; Google `access_type=offline&prompt=consent` so a refresh token actually comes back; PKCE (S256) on both; sealed AES-GCM state token carrying the exact `redirect_uri` (kills the "invalid redirect_uri" class of bug); account upsert so reconnecting never duplicates; every failure surfaced as a readable note instead of a dead end. **Mock path** so Connect is clickable with no credentials at all. *(Facebook Pages and the nightly refresh job still to do — the refresh function exists and is tested, the cron that calls it lands with the worker in S6.)*
*Exit:* connect a mock IG account and a mock YouTube channel; disconnect works. **Met in mock** — and the live path is verified against fake platform servers by `npm run smoke:oauth` (13 checks: token exchange, 60-day expiry, encrypted at rest, refresh token captured, idempotent reconnect). Live needs `META_APP_ID`/`META_APP_SECRET` and `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.

**S3 · Media box**
Upload endpoint (chunked), Drive OAuth + file pull, `ffprobe` validation, `ffmpeg` normalise (1080×1920 H.264/AAC faststart; PNG/HEIC→JPEG), R2 upload at random immutable paths, public-URL HEAD check, asset grid with validation results, lifecycle expiry.
*Exit:* drop an MOV and a PNG from Drive; both come out as valid, publicly fetchable assets with the right specs.

**S4 · Instagram publisher**
Adapter for **REEL**, then **IMAGE**, **CAROUSEL** (≤10), **STORY**: container → poll `status_code` → `media_publish`; caption/hashtag encoding; cover via `cover_url` or `thumb_offset`; `share_to_feed`; live quota read via `content_publishing_limit`; full error taxonomy → human actions; golden-JSON tests against recorded fixtures.
*Exit:* with real credentials, one Reel published end-to-end; without them, mock publish with identical code path.

**S5 · YouTube publisher**
Resumable upload (256 KB-multiple chunks, resume-on-5xx), `status.privacyStatus = private` + `publishAt`, title/description/tags/category, `selfDeclaredMadeForKids`, Shorts handling, thumbnail upload, quota accounting + `uploadLimitExceeded`/`forbiddenPrivacySetting` handling mapped to plain English.
*Exit:* a Short uploaded as Private, scheduled, and visible in YouTube Studio's scheduled list.

**S6 · Scheduler & queue**
`jobs` table + worker loop with `SKIP LOCKED` claiming, per-account posting windows with ±jitter, daily caps, idempotency on `(post_id, platform)`, exponential backoff, `needs_review` → `queued` transitions, crash-recovery semantics, queue screen.
*Exit:* schedule 3 posts, `kill -9` the worker mid-run, restart — no double-posts, no lost jobs, clear states.

**S7 · Composer, calendar, failures, dashboard**
The full composer (media picker, captions, brand→account targeting, per-platform overrides, live previews), month/week calendar with drag-to-reschedule, failure inbox with one-click retry/fix, dashboard cards (today, next 7 days, quota, token health).
*Exit:* you compose, schedule and reschedule entirely through the UI without touching the database.

**S8 · WhatsApp notifications, approvals, hardening**
`notifier` interface + CRM adapter, signed single-use approval links + webhook, published/failed alerts, 08:30 digest, quota + token alarms, audit-log screen, privacy + data-deletion pages, backup script, runbook, deployment walkthrough.
*Exit:* **you approve a post from a WhatsApp message and watch it publish unattended.**

---

## §E. Phase 2 — the agent layer (same service layer, no parallel system)

**S9 · REST API** — `/api/v1/posts`, `/posts/:id`, `/queue`, `/assets`, `/metrics`, `/accounts`, `/brands`; per-brand API keys with scopes; OpenAPI spec generated from the same Zod schemas the UI uses; rate limits; `Idempotency-Key` support; every mutation writes `events` with `actor: agent:<name>`.

**S10 · MCP server** — tools: `list_brands`, `list_accounts_with_quota`, `upload_media_from_drive`, `create_post`, `schedule_post`, `reschedule_post`, `cancel_post`, `get_queue`, `get_post_status`, `get_metrics`, `propose_content_plan`. Every tool maps 1:1 onto a REST endpoint (no special-casing), defaults to `publish_mode: "approval_required"`, and returns human-readable next steps on error.

**S11 · Notion content calendar** — one database, two-way sync: Studio reads `Idea/Draft` rows and writes back `Queued/Posted/Failed`, live URLs and error notes. Properties: `Title`, `Brand`, `Pillar`, `Media` (Files/URL), `Media type`, `Caption`, `Caption (Tamil)`, `Caption (English)`, `Hashtags`, `Targets`, `Scheduled at`, `Status`, `Approved by`, `Agent`, `External ID`, `Result links`, `Notes`.

**S12 · Drive drop conventions** — `Reels-Inbox/2026-10-20_1930__faceless-maths__reel__tn10-trig-q4__tamil.mp4` plus optional `.md`/Docs caption sidecar; watcher via Drive changes feed (or 5-min poll); parsed into a draft post automatically.

**S13 · Agent safety rails & provenance** — per-key rate limits, dry-run mode, per-brand `autopublish` gate, kill switch, an "Agent activity" view showing exactly what each agent created/queued/published, and the same approval gate as humans.

*Phase 2 exit test:* **I (an agent) write a 7-day content plan into Notion, queue it, and you approve the whole week from WhatsApp.**

---

## §F. Credential & account checklist (Phase 0 — the part only you can do)

**1. Instagram (per page that will be automated)**
1. Convert the account to a **Professional** account → Business or Creator (free, in app settings).
2. Add a contact email; enable 2FA on the owning Facebook/Instagram logins.
3. Nothing else — the app gives you the exact redirect URL to paste into Meta when we get to S2.

**2. Meta app (once, ~20 minutes)**
1. developers.facebook.com → **Create App** → type **Business**.
2. Add product **Instagram** → **API setup with Instagram login**.
3. Add each page as an **Instagram Tester** (App roles → Roles → Instagram testers) → accept the invite from each page's Instagram settings (Settings → Apps and websites → Tester invites).
4. Copy **App ID** + **App Secret** → into the Studio's `.env`. Leave the app in **Development Mode** forever — that's the trick that skips App Review.
5. (Optional, later) Add **Facebook Login for Business** if you want Page publishing + hashtag/competitor research.

**3. Google / YouTube (once, ~30 minutes + audit wait)**
1. console.cloud.google.com → new project → enable **YouTube Data API v3**.
2. OAuth consent screen: app name, your domain, **privacy policy URL**, **data-deletion URL**, scopes `youtube.upload` (+ `youtube.readonly` for stats).
3. Create OAuth **Web** client → redirect URI from the Studio → copy Client ID/Secret.
4. **Submit the YouTube API Services Audit + Quota Extension form on day one.** I'll draft the answers and the demo-video script (`docs/audit-prep.md`).
5. Until the audit passes: uploads are Private + `publishAt`; the app will label them "scheduled (pending audit)" so nothing looks broken.

**4. Cloudflare R2 (once, ~15 minutes)**
1. Create a bucket (e.g. `centum-media`) → enable public access on a custom subdomain (`media.yourdomain.in`).
2. Create an API token (Object Read & Write) → Access Key ID / Secret / endpoint → `.env`.
3. Lifecycle rule: expire objects after 45 days (retries + YouTube's data rules are satisfied well before that).

**5. Domain + legal pages (once)**
`yourdomain.in` with `/privacy` and `/data-deletion` — required for OAuth consent, the YouTube audit, and good practice. The app ships these pages pre-filled from your details.

**6. WhatsApp CRM (once)**
I need three things from you: the **base URL**, the **auth method** (API key / bearer / OAuth), and the **send-message + template endpoints**, plus whether it can **POST webhooks** to us (for the approve/reject taps). If it can only send and not receive, approvals fall back to dashboard-only and alerts still work — tell me the provider name and I'll write the adapter to it.

---

## §G. Risks and the plan for each

| Risk | Likelihood | Mitigation built into the app |
|---|---|---|
| **YouTube audit takes weeks** | Certain | Upload as Private + `publishAt` from day one; optional rented-API transport override for YouTube only; audit submitted on day 0 with drafted answers |
| **A 60-day IG token silently expires** | Medium | Nightly refresh job + 7-day advance alarm via WhatsApp + "Reconnect" deep link; refresh failures never fail silently |
| **"Media download failed" from Meta** | High in DIY builds | R2 public URL + `HEAD` verification before every publish; no Drive links ever reach Meta |
| **Instagram daily cap (25–100) hit on a busy day** | Low–Medium | Live quota read; overflow posts auto-move to the next window instead of failing |
| **Meta deprecates an API version** | Certain, eventually | API version pinned in one config file; changelog watch note in the runbook; adapters isolated so a version bump is one file |
| **Brand-new page has a tiny call budget** | Medium | Read-caching, batched calls, backoff on 429, per-account request budgets |
| **Sandbox can't reach Meta/Google** | Certain here | Mock provider implements the same interfaces; real adapters are exercised on your deployment and by golden-JSON tests |
| **VPS dies / disk full** | Low | Nightly `pg_dump` + media lifecycle on R2; documented restore in `docs/runbook.md`; app is stateless besides Postgres + R2 |
| **Matrix of pages triggers platform checks** | Low via API, high via bots | Official APIs only; staggered windows with jitter; per-page identity (caption, cover, hashtags, intro frame); originality rules; human approval gate |
| **One bad agent damages the queue** | Low | Approval-by-default, per-key scopes + rate limits, dry-run mode, kill switch, full audit trail |

---

## §H. Definition of done — Phase 1

- A human can log in, connect Instagram + YouTube accounts, upload/import media, compose a Reel and a Short, schedule them, and see them publish **without touching a terminal**.
- Every failure is visible in the UI with a plain-English cause and a next action.
- Approvals and alerts arrive on WhatsApp; approving from WhatsApp publishes the post.
- Tokens auto-refresh; quota is displayed and respected; nothing double-posts across worker restarts.
- The whole system runs from `docker compose up -d` on your VPS, backed up nightly, documented in `docs/runbook.md`.
- Audit log answers "who/what published this and when" for every single post.

---

## §I. What I need from you now

1. **Say GO** and I will: archive the old app to `legacy/`, delete the rest, and start **S1** — you'll get a live preview link in this session.
2. **Runtime**: VPS (~₹450/mo, recommended) or your own always-on machine?
3. **WhatsApp CRM**: provider name + API docs/link (or just tell me it's e.g. "Interakt / Wati / Gupshup / custom"), and whether it supports inbound webhooks.
4. **First-batch pages**: how many Instagram pages, and their rough pillars (e.g. tuition, Centum main, TN10-Maths, TN12-Bio, Motivation-Tamil).
5. **YouTube before the audit**: private+scheduled only (recommended), or add a rented-API fallback for public posts meanwhile?
