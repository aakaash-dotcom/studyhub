# Connecting Instagram

Time: ~25 minutes, once. Cost: ₹0. What you need: the Instagram accounts
(your tuition page + the Centum App page + the faceless pages), each set to
**Professional → Business** in the Instagram app.

> **Read this first.** Publishing to accounts you control does **not** require
> Meta App Review. An app in **Development Mode** can publish to any account that
> has been added as an **Instagram Tester** on that app. App Review is only
> needed if you want *other people* to log in and publish. You are not doing that.

## 1. Create the app

1. Go to <https://developers.facebook.com/apps> → **Create app**.
2. Use case: **Other** → next → type **Business**.
3. Name it `Centum Studio`, pick your business portfolio (or create one), create.
4. In the dashboard, add the product **Instagram** → **API setup with Instagram login**.

## 2. Add your accounts as testers

1. App dashboard → **App roles → Roles** → **Add people** → **Instagram Tester**.
2. Enter the username of each Instagram account you want to publish to.
3. On each account, open the Instagram app → **Settings → Apps and websites →
   Tester invites** → accept.
   *(Each account must accept, or publishing to it will fail with a permission error.)*

## 3. Copy four values into `.env`

```bash
cp .env.example .env        # then edit
```

| Key | Where it comes from |
| --- | --- |
| `META_APP_ID` | App dashboard → Settings → Basic → App ID |
| `META_APP_SECRET` | same screen → App secret (click **Show**) |
| `META_GRAPH_VERSION` | leave `v23.0` unless the dashboard shows otherwise |
| `TOKEN_ENCRYPTION_KEY` | generate once: `openssl rand -base64 32` — **never change it later**, it decrypts stored tokens |

Then set `PROVIDER_MODE=live` when you want real publishing, and
`APP_URL` to the public URL of your studio. Restart the dev server.

## 4. Verify

Open `/settings` in the studio: **Meta app configured** should flip to a green
tick, then `/accounts → Connect Instagram`. The OAuth window asks the account to
approve `instagram_business_basic` and `instagram_business_content_publish`.

### Things that bite people

- **The account must be a Professional (Business/Creator) account**, and the
  scopes above are the *Instagram login* ones — not the Facebook-Page ones.
- **Tokens last 60 days.** The studio refreshes them on a schedule and will warn
  you in WhatsApp when one is close to expiry; if a refresh ever fails the
  account is flagged on `/accounts` instead of failing silently.
- **Do not publish the same video to five accounts in the same minute.** It is
  the single most reliable way to get accounts flagged. `/accounts` carries a
  per-account daily cap and the scheduler spaces accounts out — leave it on.
- **Publishing limit is read from the API at runtime** (`content_publishing_limit`),
  never assumed. The studio asks Meta and shows the real number on `/media` and
  `/queue` instead of guessing 25 or 100.
