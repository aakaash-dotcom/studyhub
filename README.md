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
npm run db:seed        # creates .data/pglite and both brands
npm run demo:data      # optional: a demo account + two posts to click around
npm run dev            # http://localhost:3000
```

**There is no login page.** This is a single-operator studio — it opens straight
on the dashboard and runs as you, which also means no session cookie to lose and
no way to get locked out. The trade-off is that anything that can reach the port
can use it, so read [Exposing this to the internet](#exposing-this-to-the-internet)
before you put it on a public hostname.

No credentials are needed to start: `PROVIDER_MODE=mock` publishes to a fake
platform, so every button works end to end before you own a Meta app.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Studio at `0.0.0.0:3000` (light theme) |
| `npm run build` / `start` | Production build / serve |
| `npm run db:migrate` | Apply pending migrations (append-only, tracked) |
| `npm run db:seed` | Owner record + the three brands (idempotent) |
| `npm run db:reset` | Delete `.data`, migrate, seed — dev only |
| `npm run demo:data` | Demo accounts + posts; proves the approve → queue path |
| `npm run smoke:app` | Request every page and route with **no cookies** and assert 200 in one hop — fails if a login wall ever comes back |
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

**Something redirects to `/login`.** There is no login page any more — if a page
bounces you, a cookie-era redirect survived a refactor. `npm run smoke:app`
reports it immediately, by design.

**"403 FORBIDDEN — MISSING TRAFFIC ACCESS TOKEN" (a dark page with an E2B logo).**
That is the sandbox gateway, not this app: the preview URL is only served when the
request carries an `e2b-traffic-access-token` header, which the Arena preview panel
adds. A browser tab cannot send that header, so the raw URL can never be opened
directly — use the LIVE PREVIEW panel, not a copied link.

**"Invalid Server Actions request" in the logs.** Next.js rejects Server Action
POSTs whose `Origin` is not a known host. Behind the hosted preview or a tunnel,
add the host to `PREVIEW_ALLOWED_ORIGINS` before `npm run dev`.

## Exposing this to the internet

The studio has no authentication. On `localhost` that is fine; on a public VPS it
means anyone who learns the URL can publish to your accounts, connect new ones or
read your database. Put the gate at the edge instead of in the app — no code
changes, and 2 minutes of work when you deploy:

```caddy
studio.example.com {
    basic_auth {
        ravi <paste output of: caddy hash-password --plaintext 'your-password'>
    }
    reverse_proxy studio:3000
}
```

Alternatives that need no password at all: keep the port closed and reach it over
**Tailscale** or an **SSH tunnel** (`ssh -L 3000:localhost:3000 you@vps`).

One thing that is guarded regardless: the **agent API** (Phase 2) authenticates
every request with an API key, because a token can leak in ways a human session
cannot. The WhatsApp approval links are single-use and time-boxed for the same
reason.

## Status

**Phase 1 — S1 done, S2 code done.** Studio runs, database migrates and seeds,
seven screens render, no login wall anywhere, accounts connect (mock today, real
the moment credentials exist), mock publishing is wired, tests green.

| Sprint | Outcome | State |
| --- | --- | --- |
| S1 | Foundation: DB, app shell, mock providers, health check, no-login access | **done** |
| S2 | Connect accounts: Instagram Login + Google OAuth, 60-day token exchange, PKCE, sealed state | **code done** — needs your Meta/Google keys for live |
| S3 | Media box: upload → ffprobe/normalise → R2 → public URL | |
| S4 | Instagram publisher: container → poll → publish, carousels, stories | |
| S5 | YouTube publisher: resumable upload, private + `publishAt`, Shorts | |
| S6 | Scheduler: windows, jitter, per-account caps, idempotency, retries | |
| S7 | Composer/calendar/queue polish, failure triage, dashboard analytics | |
| S8 | WhatsApp CRM approvals + alerts + daily digest | |
| S9–S13 | Phase 2: REST API → MCP server → Notion calendar → Drive watcher → agent guardrails | |
