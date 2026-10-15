# Connecting YouTube

Time: ~30 minutes, once. Cost: ₹0. What you need: the Google account that owns
the YouTube channel.

> **Read this first.** Any Google Cloud project created after 28 July 2020 has
> its API uploads **locked to Private** until the **YouTube API compliance audit**
> is passed. There is no appeal and no workaround. So we do not fight it:
> uploads go up **private** with a `publishAt` timestamp, and YouTube makes them
> public on its own at the scheduled minute. You see them on the channel exactly
> when you wanted. **Submit the audit form on day one** — it takes weeks, and
> until it clears, this is the correct way to schedule YouTube videos.

## 1. Create the project

1. <https://console.cloud.google.com> → **New project** → `centum-studio`.
2. **APIs & services → Library** → enable **YouTube Data API v3**.
3. **APIs & services → OAuth consent screen**:
   - User type **External**, publishing status **Testing** is fine.
   - Add your own Google account under **Test users**.
   - Scopes: `https://www.googleapis.com/auth/youtube.upload` and
     `https://www.googleapis.com/auth/youtube.readonly`.
4. **Credentials → Create credentials → OAuth client ID → Web application**.
   - Authorised redirect URI: `https://YOUR-STUDIO-URL/api/oauth/google/callback`
     (for local testing also add `http://localhost:3000/api/oauth/google/callback`).
5. Copy the **Client ID** and **Client secret**.

## 2. Copy into `.env`

| Key | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID` | from step 1.5 |
| `GOOGLE_CLIENT_SECRET` | from step 1.5 |

Restart, then `/settings` should show **Google configured**, and
`/accounts → Connect YouTube` walks through the consent screen. Without keys that
button connects a demo channel instead, so nothing is blocked while you set the
project up.

The consent screen asks for three things, all of them on purpose: uploading to
YouTube, reading the channel, and **read-only Drive** — the last one is for the
Drive media bin, and asking once now is friendlier than a second consent later.
If you have already connected YouTube before that scope was added, reconnect to
grant it.

## 3. Submit the compliance audit

Search for *"YouTube API Services – Compliance Audit"* form and submit it with
your project number and a one-line description (`internal tool publishing our own
channels' videos`). Until it is approved:

- uploads land **private** with `publishAt` set → they go public automatically;
- the studio labels YouTube targets as *scheduled* rather than *public now*;
- nothing is lost, you simply cannot pin a video to the top of the feed early.

## 4. Quotas you should know

- `videos.insert` costs ~100 units from a **separate ~100-call/day bucket** — that
  is ~1 upload/hour sustained, plenty here, and the queue spreads uploads out.
- Shorts are normal uploads that are ≤3 minutes tall 9:16 — the media box
  normalises to 1080×1920 and the composer tags them as Shorts.
- Resumable upload chunks must be multiples of 256 KB; the publisher handles it.
- Title ≤100 characters, description ≤5,000 bytes, tags ≤500 characters —
  validated in the composer before you hit submit.
