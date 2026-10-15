import { test } from "node:test";
import assert from "node:assert/strict";
import { createPkcePair, authorizationUrl, scopesFor, authPathFor, OAUTH_PLATFORMS } from "@centum/providers";
import { openOAuthState, sealOAuthState } from "@centum/core";
import { createHash } from "node:crypto";

/**
 * Sprint 2 rules worth freezing: the state token carries the redirect_uri (so a
 * mismatch cannot cause "invalid redirect_uri" at the callback), and the PKCE
 * challenge really is the S256 of the verifier the callback will send back.
 */

test("state token round-trips and is not readable", () => {
  const state = sealOAuthState({
    platform: "youtube",
    brandId: "brand-1",
    redirectUri: "https://studio.example.com/api/oauth/youtube/callback",
    verifier: "verifier-abc",
  });
  assert.ok(!state.includes("youtube"), "state must not leak the platform in plaintext");
  const intent = openOAuthState(state);
  assert.equal(intent.platform, "youtube");
  assert.equal(intent.brandId, "brand-1");
  assert.equal(intent.redirectUri, "https://studio.example.com/api/oauth/youtube/callback");
  assert.equal(intent.verifier, "verifier-abc");
});

test("expired states are refused with a human explanation", () => {
  const state = sealOAuthState({ platform: "instagram", brandId: null, redirectUri: "https://x/cb", verifier: null });
  assert.throws(() => openOAuthState(state, Date.now() + 16 * 60 * 1000), /expired/i);
});

test("garbage and truncated states are refused, never half-parsed", () => {
  assert.throws(() => openOAuthState("not-a-real-state"));
  const state = sealOAuthState({ platform: "instagram", brandId: null, redirectUri: "https://x/cb", verifier: null });
  assert.throws(() => openOAuthState(state.slice(0, state.length - 8)));
});

test("PKCE challenge is S256 of the verifier, base64url without padding", () => {
  const { verifier, challenge } = createPkcePair();
  const expected = createHash("sha256").update(verifier).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  assert.equal(challenge, expected);
  assert.ok(!challenge.includes("+") && !challenge.includes("/") && !challenge.includes("="));
  assert.ok(verifier.length >= 43);
});

test("Instagram consent URL asks for the publishing scopes on the right host", () => {
  const url = new URL(
    authorizationUrl("instagram", {
      clientId: "app-123",
      redirectUri: "https://studio.example.com/api/oauth/instagram/callback",
      state: "sealed",
      codeChallenge: "challenge",
    }),
  );
  assert.equal(url.host, "www.instagram.com");
  assert.equal(url.pathname, "/oauth/authorize");
  assert.equal(url.searchParams.get("scope"), "instagram_business_basic,instagram_business_content_publish");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
});

test("Google consent URL requests offline access — without it there is no refresh token", () => {
  const url = new URL(
    authorizationUrl("youtube", {
      clientId: "client-123",
      redirectUri: "https://studio.example.com/api/oauth/youtube/callback",
      state: "sealed",
      codeChallenge: "challenge",
    }),
  );
  assert.equal(url.host, "accounts.google.com");
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("prompt"), "consent");
  const scopes = url.searchParams.get("scope") ?? "";
  assert.ok(scopes.includes("youtube.upload"));
  assert.ok(scopes.includes("drive.readonly"), "Drive access is requested once, now, for the Sprint 12 media bin");
});

test("every platform maps to a stored auth path", () => {
  for (const platform of OAUTH_PLATFORMS) {
    if (platform === "facebook") continue; // Pages is a documented later add-on
    assert.ok(authPathFor(platform).length > 0);
    assert.ok(scopesFor(platform).length > 0);
  }
});
