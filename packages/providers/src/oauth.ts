import { createHash, randomBytes } from "node:crypto";
import type { AuthPath } from "@centum/core";

/**
 * The OAuth half of each platform adapter: consent URL, code exchange, profile
 * lookup, token refresh.
 *
 * Two rules learned from the platform docs, both encoded here:
 *  - Instagram Login talks to THREE different hosts (www.instagram.com to ask,
 *    api.instagram.com to swap the code, graph.instagram.com to use the token)
 *    and the swap returns a 1-hour token that must then be exchanged for the
 *    60-day one. Get that wrong and publishing "randomly" fails an hour later.
 *  - Google only returns a refresh token when asked with access_type=offline
 *    AND prompt=consent. Get that wrong and the connection dies silently in a
 *    week, at which point nothing can refresh it.
 *
 * Every endpoint can be overridden through the environment so the whole flow can
 * be exercised against a fake provider (see scripts/smoke-oauth.ts) — no real
 * account is needed to prove the plumbing.
 */

export type OAuthPlatform = "instagram" | "youtube" | "facebook";

export const OAUTH_PLATFORMS: readonly OAuthPlatform[] = ["instagram", "youtube", "facebook"] as const;

const IG_VERSION = "v23.0";

function env(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value ? value.replace(/\/$/, "") : fallback;
}

/** Instagram: three hosts, each overridable for tests. */
function instagramEndpoints() {
  return {
    authorize: env("IG_AUTHORIZE_BASE", "https://www.instagram.com"),
    token: env("IG_TOKEN_BASE", "https://api.instagram.com"),
    api: env("IG_API_BASE", "https://graph.instagram.com"),
  };
}

function googleEndpoints() {
  return {
    authorize: env("GOOGLE_AUTHORIZE_BASE", "https://accounts.google.com"),
    token: env("GOOGLE_TOKEN_BASE", "https://oauth2.googleapis.com"),
    api: env("GOOGLE_API_BASE", "https://www.googleapis.com"),
  };
}

export const INSTAGRAM_SCOPES = ["instagram_business_basic", "instagram_business_content_publish"] as const;
/** drive.readonly is asked for once, now, because Sprint 12 reads the Drive media bin. */
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
] as const;

export function scopesFor(platform: OAuthPlatform): string[] {
  if (platform === "instagram") return [...INSTAGRAM_SCOPES];
  if (platform === "youtube") return [...GOOGLE_SCOPES];
  return [];
}

export function authPathFor(platform: OAuthPlatform): AuthPath {
  if (platform === "instagram") return "instagram_login";
  if (platform === "facebook") return "facebook_login";
  return "google";
}

export function supportsPkce(platform: OAuthPlatform): boolean {
  // Instagram Login and Google both speak standard PKCE; Facebook uses its own.
  return platform === "instagram" || platform === "youtube";
}

// ── PKCE ────────────────────────────────────────────────────────────────────
const base64url = (input: Buffer): string =>
  input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

// ── consent URL ─────────────────────────────────────────────────────────────
export type AuthorizeInput = {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge?: string | null;
};

export function authorizationUrl(platform: OAuthPlatform, input: AuthorizeInput): string {
  if (platform === "instagram") {
    const { authorize } = instagramEndpoints();
    const url = new URL(`${authorize}/oauth/authorize`);
    url.searchParams.set("client_id", input.clientId);
    url.searchParams.set("redirect_uri", input.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scopesFor("instagram").join(","));
    url.searchParams.set("state", input.state);
    if (input.codeChallenge) {
      url.searchParams.set("code_challenge", input.codeChallenge);
      url.searchParams.set("code_challenge_method", "S256");
    }
    return url.toString();
  }

  if (platform === "youtube") {
    const { authorize } = googleEndpoints();
    const url = new URL(`${authorize}/o/oauth2/v2/auth`);
    url.searchParams.set("client_id", input.clientId);
    url.searchParams.set("redirect_uri", input.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scopesFor("youtube").join(" "));
    url.searchParams.set("state", input.state);
    url.searchParams.set("access_type", "offline"); // -> refresh token
    url.searchParams.set("prompt", "consent"); // -> refresh token, every time
    url.searchParams.set("include_granted_scopes", "true");
    if (input.codeChallenge) {
      url.searchParams.set("code_challenge", input.codeChallenge);
      url.searchParams.set("code_challenge_method", "S256");
    }
    return url.toString();
  }

  throw new Error(`No OAuth consent flow for ${platform} yet (Facebook Pages is a later add-on).`);
}

// ── code exchange ───────────────────────────────────────────────────────────
export type TokenExchangeInput = {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  codeVerifier?: string | null;
  fetchImpl?: typeof fetch;
};

export type TokenResult = {
  accessToken: string;
  refreshToken: string | null;
  /** Absolute expiry, derived from expires_in when the platform provides one. */
  expiresAt: Date | null;
  scopes: string[];
};

export async function exchangeCode(platform: OAuthPlatform, input: TokenExchangeInput): Promise<TokenResult> {
  const doFetch = input.fetchImpl ?? fetch;

  if (platform === "instagram") {
    const { token, api } = instagramEndpoints();
    // 1) short-lived token (~1 hour)
    const shortForm = new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: input.redirectUri,
      code: input.code,
    });
    if (input.codeVerifier) shortForm.set("code_verifier", input.codeVerifier);

    const shortRes = await doFetch(`${token}/oauth/access_token`, { method: "POST", body: shortForm });
    const shortJson = (await shortRes.json()) as Record<string, unknown>;
    if (!shortRes.ok || typeof shortJson.access_token !== "string") {
      throw new Error(`Instagram rejected the code: ${describe(shortJson)}`);
    }

    // 2) long-lived token (~60 days) — without this step publishing dies in an hour
    const longUrl = new URL(`${api}/access_token`);
    longUrl.searchParams.set("grant_type", "ig_exchange_token");
    longUrl.searchParams.set("client_secret", input.clientSecret);
    longUrl.searchParams.set("access_token", shortJson.access_token as string);

    const longRes = await doFetch(longUrl.toString());
    const longJson = (await longRes.json()) as Record<string, unknown>;
    if (!longRes.ok || typeof longJson.access_token !== "string") {
      throw new Error(`Instagram refused to extend the token: ${describe(longJson)}`);
    }

    return {
      accessToken: longJson.access_token as string,
      refreshToken: null, // Instagram refreshes the same token instead of issuing another
      expiresAt: secondsFromNow(longJson.expires_in, 60 * 24 * 60 * 60),
      scopes: scopesFor("instagram"),
    };
  }

  if (platform === "youtube") {
    const { token } = googleEndpoints();
    const form = new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code",
    });
    if (input.codeVerifier) form.set("code_verifier", input.codeVerifier);

    const res = await doFetch(`${token}/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok || typeof json.access_token !== "string") {
      throw new Error(`Google rejected the code: ${describe(json)}`);
    }

    return {
      accessToken: json.access_token as string,
      refreshToken: typeof json.refresh_token === "string" ? json.refresh_token : null,
      expiresAt: secondsFromNow(json.expires_in, 3600),
      scopes: typeof json.scope === "string" ? json.scope.split(" ") : scopesFor("youtube"),
    };
  }

  throw new Error(`No code exchange for ${platform} yet.`);
}

/** Google: swap a refresh token for a new access token. Instagram: extend in place. */
export async function refreshAccessToken(
  platform: OAuthPlatform,
  input: { clientId: string; clientSecret: string; refreshToken: string; fetchImpl?: typeof fetch },
): Promise<TokenResult> {
  const doFetch = input.fetchImpl ?? fetch;

  if (platform === "instagram") {
    const { api } = instagramEndpoints();
    const url = new URL(`${api}/refresh_access_token`);
    url.searchParams.set("grant_type", "ig_refresh_token");
    url.searchParams.set("access_token", input.refreshToken);
    const res = await doFetch(url.toString());
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok || typeof json.access_token !== "string") {
      throw new Error(`Instagram refused the refresh: ${describe(json)}`);
    }
    return {
      accessToken: json.access_token as string,
      refreshToken: input.refreshToken,
      expiresAt: secondsFromNow(json.expires_in, 60 * 24 * 60 * 60),
      scopes: scopesFor("instagram"),
    };
  }

  if (platform === "youtube") {
    const { token } = googleEndpoints();
    const form = new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      refresh_token: input.refreshToken,
      grant_type: "refresh_token",
    });
    const res = await doFetch(`${token}/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok || typeof json.access_token !== "string") {
      throw new Error(`Google refused the refresh: ${describe(json)}`);
    }
    return {
      accessToken: json.access_token as string,
      refreshToken: input.refreshToken,
      expiresAt: secondsFromNow(json.expires_in, 3600),
      scopes: typeof json.scope === "string" ? json.scope.split(" ") : scopesFor("youtube"),
    };
  }

  throw new Error(`No refresh flow for ${platform} yet.`);
}

// ── profile ─────────────────────────────────────────────────────────────────
export type OAuthProfile = {
  platformAccountId: string;
  handle: string;
  displayName: string;
  extra?: Record<string, unknown>;
};

export async function fetchProfile(
  platform: OAuthPlatform,
  input: { accessToken: string; fetchImpl?: typeof fetch },
): Promise<OAuthProfile> {
  const doFetch = input.fetchImpl ?? fetch;

  if (platform === "instagram") {
    const { api } = instagramEndpoints();
    const url = new URL(`${api}/${IG_VERSION}/me`);
    url.searchParams.set("fields", "user_id,username,account_type");
    url.searchParams.set("access_token", input.accessToken);
    const res = await doFetch(url.toString());
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) throw new Error(`Instagram profile lookup failed: ${describe(json)}`);

    const id = String(json.user_id ?? json.id ?? "");
    if (!id) throw new Error(`Instagram returned no account id: ${describe(json)}`);
    const username = typeof json.username === "string" ? json.username : id;
    return {
      platformAccountId: id,
      handle: username.startsWith("@") ? username : `@${username}`,
      displayName: username,
      extra: { accountType: json.account_type },
    };
  }

  if (platform === "youtube") {
    const { api } = googleEndpoints();
    const url = new URL(`${api}/youtube/v3/channels`);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("mine", "true");
    const res = await doFetch(url.toString(), { headers: { authorization: `Bearer ${input.accessToken}` } });
    const json = (await res.json()) as { items?: Array<Record<string, unknown>> };
    if (!res.ok) throw new Error(`YouTube channel lookup failed: ${describe(json)}`);

    const channel = json.items?.[0];
    if (!channel) throw new Error("That Google account has no YouTube channel — create one first.");
    const snippet = (channel.snippet ?? {}) as Record<string, unknown>;
    const contentDetails = (channel.contentDetails ?? {}) as Record<string, unknown>;
    const uploads = (contentDetails.relatedPlaylists ?? {}) as Record<string, unknown>;
    return {
      platformAccountId: String(channel.id),
      handle: typeof snippet.customUrl === "string" ? snippet.customUrl : String(channel.id),
      displayName: typeof snippet.title === "string" ? snippet.title : String(channel.id),
      extra: { uploadsPlaylistId: uploads.uploads ?? null },
    };
  }

  throw new Error(`No profile lookup for ${platform} yet.`);
}

// ── helpers ─────────────────────────────────────────────────────────────────
function secondsFromNow(value: unknown, fallbackSeconds: number): Date {
  const seconds = typeof value === "number" && value > 0 ? value : fallbackSeconds;
  return new Date(Date.now() + seconds * 1000);
}

/** Platform errors are JSON; surface the message instead of "[object Object]". */
function describe(json: unknown): string {
  if (json && typeof json === "object") {
    const record = json as Record<string, unknown>;
    const error = record.error;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const detail = error as Record<string, unknown>;
      if (typeof detail.message === "string") return detail.message;
    }
    if (typeof record.error_description === "string") return record.error_description;
    if (typeof record.message === "string") return record.message;
  }
  return JSON.stringify(json)?.slice(0, 300) ?? "unknown error";
}
