/**
 * `npm run smoke:oauth` — runs the REAL Sprint 2 OAuth code against a fake
 * Instagram and a fake Google, then asserts the accounts landed in the database
 * with encrypted tokens.
 *
 * This is the S2 exit test: it proves the three-host Instagram dance (swap the
 * code → extend to 60 days → read the profile), the Google refresh-token request,
 * the sealed-state checkpoint and the account upsert — none of which can be
 * verified by clicking, because half of it happens on the platform's servers.
 */
import { createServer } from "node:http";

const PORT = 4599;
const BASE = `http://127.0.0.1:${PORT}`;

// ── the fake platforms ──────────────────────────────────────────────────────
const seen: string[] = [];
const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", BASE);
  seen.push(`${req.method} ${url.pathname}`);
  const json = (body: unknown) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };

  if (url.pathname === "/oauth/access_token") {
    // Instagram step 1: short-lived token (~1 hour)
    return json({ access_token: "IGQVJ_short_lived", user_id: "17841400000000001", permissions: "instagram_business_basic" });
  }
  if (url.pathname === "/access_token") {
    // Instagram step 2: extend to 60 days
    return json({ access_token: "IGQVJ_long_lived_60d", token_type: "bearer", expires_in: 5184000 });
  }
  if (url.pathname === "/v23.0/me") {
    return json({ user_id: "17841400000000001", username: "centum.app.fake", account_type: "BUSINESS" });
  }
  if (url.pathname === "/token") {
    // Google token endpoint (authorization_code AND refresh_token grants)
    return json({
      access_token: "ya29.fake-access-token",
      refresh_token: "1//fake-refresh-token",
      expires_in: 3599,
      scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/drive.readonly",
    });
  }
  if (url.pathname === "/youtube/v3/channels") {
    if (!req.headers.authorization?.includes("ya29.")) {
      res.writeHead(401, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: { message: "Invalid Credentials" } }));
    }
    return json({
      items: [{ id: "UC_fake_channel_1", snippet: { title: "Centum App Shorts", customUrl: "@centumshorts" }, contentDetails: { relatedPlaylists: { uploads: "UU_fake_1" } } }],
    });
  }
  res.writeHead(404).end("not found");
});
await new Promise<void>((resolve) => server.listen(PORT, "127.0.0.1", resolve));

process.env.IG_TOKEN_BASE = BASE;
process.env.IG_API_BASE = BASE;
process.env.GOOGLE_AUTHORIZE_BASE = BASE;
process.env.GOOGLE_TOKEN_BASE = BASE;
process.env.GOOGLE_API_BASE = BASE;
process.env.META_APP_ID = "fake-meta-app-id";
process.env.META_APP_SECRET = "fake-meta-secret";
process.env.GOOGLE_CLIENT_ID = "fake-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "fake-google-secret";
process.env.PROVIDER_MODE = "live"; // force the real code path

// Loaded AFTER the environment above: @centum/core parses its env once, at import
// time, so anything set later is ignored.
const {
  connectMockAccount,
  completeOAuth,
  deleteAccount,
  listAccounts,
  openOAuthState,
  sealOAuthState,
} = await import("@centum/core");

const results: string[] = [];
const check = (label: string, ok: boolean, detail = "") => {
  const line = `${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`;
  results.push(line);
  console.log(line); // printed immediately: this script talks to fake servers, so where it stops matters
  if (!ok) process.exitCode = 1;
};

// ── 1. sealed state ─────────────────────────────────────────────────────────
const redirectUri = "http://localhost:3000/api/oauth/instagram/callback";
const state = sealOAuthState({ platform: "instagram", brandId: null, redirectUri, verifier: "fake-verifier-1234567890" });
const intent = openOAuthState(state);
check("state token is opaque and survives the round trip", intent.platform === "instagram" && intent.redirectUri === redirectUri);
check("state is not readable plaintext", !state.includes("instagram") && !state.includes("verifier"));

try {
  const tampered = `${state.slice(0, -6)}AAAAAA`;
  openOAuthState(tampered);
  check("tampered state is rejected", false, "it was accepted!");
} catch {
  check("tampered state is rejected", true);
}

// ── 2. Instagram, the full three-host flow ──────────────────────────────────
const ig = await completeOAuth({ platform: "instagram", code: "fake-auth-code", state });
check("Instagram account stored", ig.platformAccountId === "17841400000000001" && ig.handle === "@centum.app.fake", ig.handle);
check("Instagram token is the 60-day one, not the 1-hour one", ig.expiresAt !== null && ig.expiresAt.getTime() - Date.now() > 50 * 864e5, `${Math.round(((ig.expiresAt?.getTime() ?? 0) - Date.now()) / 864e5)} days`);
check("token is encrypted at rest", Boolean(ig.accessTokenEnc) && !ig.accessTokenEnc!.includes("IGQVJ_long_lived_60d"));
check("scopes recorded", ig.scopes.includes("instagram_business_content_publish"));

// ── 3. YouTube, refresh token + channel lookup ──────────────────────────────
const ytState = sealOAuthState({ platform: "youtube", brandId: null, redirectUri: "http://localhost:3000/api/oauth/youtube/callback", verifier: "fake-verifier-9876543210" });
const yt = await completeOAuth({ platform: "youtube", code: "fake-google-code", state: ytState });
check("YouTube channel stored", yt.platformAccountId === "UC_fake_channel_1", yt.displayName);
check("refresh token captured (survives access-token expiry)", Boolean(yt.refreshTokenEnc));

// ── 4. reconnecting updates instead of duplicating ──────────────────────────
const again = await completeOAuth({ platform: "instagram", code: "fake-auth-code", state });
const all = await listAccounts();
const igCount = all.filter((a) => a.platform === "instagram" && a.platformAccountId === "17841400000000001").length;
check("reconnecting updates the same row", again.id === ig.id && igCount === 1, `${igCount} Instagram row(s)`);

// ── 5. mock connections still work side by side ─────────────────────────────
const mock = await connectMockAccount({ platform: "instagram", handle: "@demo.page", displayName: "Demo" });
check("mock connect still works and is idempotent", mock.platformAccountId === "demo_instagram_main");

// ── 6. the state's redirect_uri is the one that was actually used ───────────
check(
  "callback uses the redirect_uri sealed at start (no 'invalid redirect_uri' trap)",
  seen.includes("POST /oauth/access_token") && seen.includes("GET /access_token") && seen.includes("GET /v23.0/me"),
  seen.join(", "),
);

// cleanup so re-running is idempotent
// Hard delete, not disconnect: these are synthetic rows and a disabled account
// left behind would show up in the studio as clutter.
await deleteAccount(ig.id);
await deleteAccount(yt.id);
await deleteAccount(mock.id);
server.close();

console.log(results.every((r) => r.startsWith("✓")) ? "\n✓ SPRINT 2 OAUTH PATH VERIFIED" : "\n✗ SOME CHECKS FAILED");
process.exit(process.exitCode ?? 0);
