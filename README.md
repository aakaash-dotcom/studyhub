# Centum Studio

One place to run Instagram + YouTube for the tuition centre, the **Centum App**
brand, and the faceless funnel pages around them.

You write a post once, attach media, pick the accounts, pick a time — Centum
Studio publishes it through the **official Instagram and YouTube APIs** and tells
you what happened. No browser automation, no password sharing, no ban risk.

Because it is built to be operated by an AI agent too, every screen you see is
backed by the same service functions an agent API will call (Phase 2). The
dashboard is not a wrapper around an agent API — both are clients of the same core.

- **Why it exists, what was considered, what it costs:** [`PLAN.md`](PLAN.md)
- **Sprint plan and exit tests:** [`BUILD_PLAN.md`](BUILD_PLAN.md)
- **Setup runbooks:** [`docs/setup/`](docs/setup/)

---

## Quickstart (development)

```bash
npm install
npm run db:seed        # creates .data/pglite, admin user, both brands
npm run demo:data      # optional: a demo account + two posts to click around
npm run dev            # http://localhost:3000
```

Sign in with `ravi@centum.local` / `centum-admin` (change these in `.env` before
you expose the studio to the internet).

No credentials are needed to start: `PROVIDER_MODE=mock` publishes to a fake
platform, so every button works end to end before you own a Meta app.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Studio at `0.0.0.0:3000` (light theme) |
| `npm run build` / `start` | Production build / serve |
| `npm run db:migrate` | Apply pending migrations (append-only, tracked) |
| `npm run db:seed` | Admin user + the three brands (idempotent) |
| `npm run db:reset` | Delete `.data`, migrate, seed — dev only |
| `npm run demo:data` | Demo accounts + posts; proves the approve → queue path |
| `npm run session:dev` | Print a login cookie for `curl` testing |
| `npm run smoke:login` | Sign in exactly as a browser does and verify the session sticks (set `PROXY_HOST`/`PROXY_ORIGIN` to test the preview's iframe + https path) |
| `npm run smoke:oauth` | Run the real connect flow against fake Instagram/Google servers — proves the token exchange, PKCE, sealed state and account upsert without any credentials |
| `npm run typecheck` | TypeScript, whole workspace |
| `npm test` | Test suite (no network, no credentials needed) |
| `npm run verify` | `typecheck` + `test` — the gate before every commit |

### Layout

```
apps/studio        Next.js dashboard (the only app you run today)
packages/core      env, crypto, db + migrations, services, seed — the same
                   functions the dashboard and the future agent API both call
packages/providers Instagram / YouTube / Facebook adapters + media rules
packages/media     ffmpeg normalise + Cloudflare R2 upload
packages/notify    WhatsApp CRM notifier (approvals, alerts, digest)
scripts/           seed, demo data, dev session
tests/             node:test suite
legacy/            the previous StudyHub app, archived (git tag legacy-studyhub-v1)
```

## Troubleshooting

**"Sign in" appears to work and then bounces back to the login page.**
That is a cookie problem, never a password problem — the studio tells you which by
answering at `/api/auth/ping` (reload it: `"state": "echoed"` means cookies work,
`"set"` twice means the browser is refusing them) and `/api/health`
(`"session": "present"`). Browsers drop cookies for apps shown inside a
cross-site frame, so the cookie is `SameSite=None; Secure` whenever the studio is
served over https, and the login screen offers a plain link to open the app in its
own tab, which always works. Run `npm run smoke:login` to prove the whole path
from the command line.

**"403 FORBIDDEN — MISSING TRAFFIC ACCESS TOKEN" (a dark page with an E2B logo).**
That is the sandbox gateway, not this app: the preview URL is only served when the
request carries an `e2b-traffic-access-token` header, which the Arena preview panel
adds. A browser tab cannot send that header, so the raw URL can never be opened
directly — use the LIVE PREVIEW panel, not a copied link.

**"Invalid Server Actions request" in the logs.** Next.js rejects Server Action
POSTs whose `Origin` is not a known host. Behind the hosted preview or a tunnel,
add the host to `PREVIEW_ALLOWED_ORIGINS` before `npm run dev`. Sign-in and
sign-out do not use Server Actions at all (they are plain form endpoints under
`/api/auth/`), so they keep working regardless.

## Status

**Phase 1 — S1 done, S2 code done.** Studio runs, database migrates and seeds,
seven screens render, auth works, accounts connect (mock today, real the moment
credentials exist), mock publishing is wired, 27 tests green.

| Sprint | Outcome | State |
| --- | --- | --- |
| S1 | Foundation: DB, auth, layout, mock providers, health check | **done** |
| S2 | Connect accounts: Instagram Login + Google OAuth, 60-day token exchange, PKCE, sealed state | **code done** — needs your Meta/Google keys for live |
| S3 | Media box: upload → ffprobe/normalise → R2 → public URL | |
| S4 | Instagram publisher: container → poll → publish, carousels, stories | |
| S5 | YouTube publisher: resumable upload, private + `publishAt`, Shorts | |
| S6 | Scheduler: windows, jitter, per-account caps, idempotency, retries | |
| S7 | Composer/calendar/queue polish, failure triage, dashboard analytics | |
| S8 | WhatsApp CRM approvals + alerts + daily digest | |
| S9–S13 | Phase 2: REST API → MCP server → Notion calendar → Drive watcher → agent guardrails | |
