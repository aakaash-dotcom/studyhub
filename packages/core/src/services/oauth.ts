import { decryptSecret, encryptSecret } from "../crypto";
import { env, hasGoogleCredentials, hasMetaCredentials } from "../env";
import { log } from "../logger";
import { recordEvent } from "../audit";
import {
  createPkcePair,
  exchangeCode,
  fetchProfile,
  authorizationUrl,
  authPathFor,
  scopesFor,
  supportsPkce,
  type OAuthPlatform,
} from "@centum/providers";
import { createAccount } from "./accounts";
import type { Account } from "./accounts";

/**
 * Connecting accounts (Sprint 2).
 *
 * The consent round-trip is browser-based and hostile: the user can take ten
 * minutes to finish, the callback arrives as a plain GET, and anyone can hit it
 * with a made-up `code`. So the state parameter carries everything the callback
 * needs — platform, brand, PKCE verifier, and the exact redirect_uri used — in a
 * single AES-GCM sealed token. Nothing is stored server-side, nothing can be
 * tampered with, and the redirect_uri in the token is guaranteed to match the one
 * the platform saw (a mismatch here is the classic "invalid redirect_uri" trap).
 */

const STATE_TTL_MS = 15 * 60 * 1000;

export type { OAuthPlatform } from "@centum/providers";

export type OAuthIntent = {
  platform: OAuthPlatform;
  brandId: string | null;
  redirectUri: string;
  verifier: string | null;
  issuedAt: number;
};

export function sealOAuthState(intent: Omit<OAuthIntent, "issuedAt">): string {
  const payload: OAuthIntent = { ...intent, issuedAt: Date.now() };
  return encryptSecret(JSON.stringify(payload));
}

export function openOAuthState(state: string, now = Date.now()): OAuthIntent {
  let parsed: OAuthIntent;
  try {
    parsed = JSON.parse(decryptSecret(state)) as OAuthIntent;
  } catch {
    throw new Error("This connection link is not valid. Start again from the Accounts page.");
  }
  if (!parsed?.platform || !parsed.redirectUri) {
    throw new Error("This connection link is incomplete. Start again from the Accounts page.");
  }
  if (typeof parsed.issuedAt !== "number" || now - parsed.issuedAt > STATE_TTL_MS) {
    throw new Error("This connection link expired (they last 15 minutes). Start again from the Accounts page.");
  }
  return parsed;
}

export function isPlatformConfigured(platform: OAuthPlatform): boolean {
  if (platform === "instagram" || platform === "facebook") return hasMetaCredentials();
  if (platform === "youtube") return hasGoogleCredentials();
  return false;
}

export type StartOAuthResult =
  | { mode: "live"; url: string }
  | { mode: "mock"; reason: string };

/**
 * Build the consent URL. With no credentials (or PROVIDER_MODE=mock) we return
 * `mode: "mock"` instead — the caller then connects a demo account so the whole
 * product stays clickable before the Meta app and Google project exist.
 */
export async function startOAuth(input: {
  platform: OAuthPlatform;
  brandId?: string | null;
  redirectUri: string;
}): Promise<StartOAuthResult> {
  const mockMode = env().PROVIDER_MODE === "mock";

  if (mockMode || !isPlatformConfigured(input.platform)) {
    return {
      mode: "mock",
      reason: mockMode
        ? "PROVIDER_MODE=mock"
        : input.platform === "youtube"
          ? "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set"
          : "META_APP_ID / META_APP_SECRET are not set",
    };
  }

  const clientId = input.platform === "youtube" ? env().GOOGLE_CLIENT_ID! : env().META_APP_ID!;
  const pkce = supportsPkce(input.platform) ? createPkcePair() : null;
  const state = sealOAuthState({
    platform: input.platform,
    brandId: input.brandId ?? null,
    redirectUri: input.redirectUri,
    verifier: pkce?.verifier ?? null,
  });

  return {
    mode: "live",
    url: authorizationUrl(input.platform, {
      clientId,
      redirectUri: input.redirectUri,
      state,
      codeChallenge: pkce?.challenge ?? null,
    }),
  };
}

/** The callback half: verify state, swap the code, read the profile, store tokens. */
export async function completeOAuth(input: {
  platform: OAuthPlatform;
  code: string;
  state: string;
  brandIdOverride?: string | null;
}): Promise<Account> {
  const intent = openOAuthState(input.state);
  if (intent.platform !== input.platform) {
    throw new Error("This connection link was opened on the wrong platform. Start again from the Accounts page.");
  }

  const clientId = input.platform === "youtube" ? env().GOOGLE_CLIENT_ID : env().META_APP_ID;
  const clientSecret = input.platform === "youtube" ? env().GOOGLE_CLIENT_SECRET : env().META_APP_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      input.platform === "youtube"
        ? "Google credentials are missing — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        : "Meta credentials are missing — add META_APP_ID and META_APP_SECRET.",
    );
  }

  const tokens = await exchangeCode(input.platform, {
    clientId,
    clientSecret,
    code: input.code,
    redirectUri: intent.redirectUri,
    codeVerifier: intent.verifier,
  });

  const profile = await fetchProfile(input.platform, { accessToken: tokens.accessToken });

  const account = await createAccount({
    platform: input.platform,
    authPath: authPathFor(input.platform),
    platformAccountId: profile.platformAccountId,
    handle: profile.handle,
    displayName: profile.displayName,
    brandId: input.brandIdOverride ?? intent.brandId ?? null,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? undefined,
    scopes: tokens.scopes,
    expiresAt: tokens.expiresAt,
  });

  log.info(
    { platform: account.platform, handle: account.handle, expiresAt: tokens.expiresAt },
    "account connected via OAuth",
  );
  await recordEvent({
    type: "oauth.completed",
    actor: "human:studio",
    subject: account.id,
    payload: { platform: account.platform, handle: account.handle, scopes: tokens.scopes },
  });
  return account;
}

/**
 * Mock connections. Same account shape, same service, fake profile — so the
 * accounts page, the composer and the queue behave identically before any real
 * credential exists, and switching to live changes nothing but the tokens.
 */
export async function connectMockAccount(input: {
  platform: OAuthPlatform;
  brandId?: string | null;
  handle?: string;
  displayName?: string;
}): Promise<Account> {
  // Stable ids: clicking Connect twice reconnects the same demo account instead
  // of piling up new rows (createAccount upserts on platform + account id).
  const defaults =
    input.platform === "instagram"
      ? { id: "demo_instagram_main", handle: "@centum.app", displayName: "Centum App (demo)" }
      : input.platform === "youtube"
        ? { id: "demo_youtube_main", handle: "@centumshorts", displayName: "Centum App Shorts (demo)" }
        : { id: "demo_facebook_main", handle: "Centum Page", displayName: "Centum App Page (demo)" };

  const account = await createAccount({
    platform: input.platform,
    authPath: authPathFor(input.platform),
    platformAccountId: defaults.id,
    handle: input.handle ?? defaults.handle,
    displayName: input.displayName ?? defaults.displayName,
    brandId: input.brandId ?? null,
    accessToken: "mock-token",
    scopes: scopesFor(input.platform),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  });

  await recordEvent({
    type: "oauth.mock_connected",
    actor: "human:studio",
    subject: account.id,
    payload: { platform: account.platform, reason: "PROVIDER_MODE=mock or credentials absent" },
  });
  return account;
}
