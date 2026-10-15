import type { MediaType, Platform } from "@centum/core";

/**
 * The contract every platform adapter implements. One adapter per platform,
 * uniform result shape, typed error codes — the pattern that makes a scheduler
 * predictable to operate (PLAN.md §3).
 */

export type PublishAsset = {
  id: string;
  kind: "image" | "video";
  publicUrl: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  durationS?: number | null;
  bytes?: number | null;
};

export type PublishInput = {
  platform: Platform;
  mediaType: MediaType;
  /** Decrypted short-lived access token for THIS account. */
  accessToken: string;
  account: {
    id: string;
    platformAccountId: string;
    handle: string;
    authPath: string;
  };
  caption: string;
  hashtags: string[];
  assets: PublishAsset[];
  options: {
    shareToFeed?: boolean;
    coverUrl?: string | null;
    thumbOffsetMs?: number | null;
    ytTitle?: string | null;
    ytDesc?: string | null;
    ytTags?: string[] | null;
    ytCategory?: string | null;
    ytShorts?: boolean;
    ytPrivacy?: "private" | "public" | "unlisted";
    scheduledAt?: Date | null;
  };
  /** Injected so tests can stub the network. */
  fetchImpl?: typeof fetch;
};

export type PublishSuccess = {
  ok: true;
  remoteId: string;
  remoteUrl: string | null;
  /** Instagram containers need polling; YouTube may need a post-upload step. */
  notes?: string[];
};

export type PublishErrorCode =
  | "token_expired"
  | "permission_denied"
  | "rate_limited"
  | "quota_exceeded"
  | "media_rejected"
  | "media_fetch_failed"
  | "privacy_restricted"
  | "duplicate"
  | "platform_error"
  | "network_error"
  | "not_implemented";

export type PublishFailure = {
  ok: false;
  code: PublishErrorCode;
  message: string;
  /** Plain-English next action for the failures screen. */
  action: string;
  retryable: boolean;
  raw?: unknown;
};

export type PublishResult = PublishSuccess | PublishFailure;

export type ProviderAdapter = {
  platform: Platform;
  supportedMediaTypes: readonly MediaType[];
  /** Cheap pre-flight: catch most rejections before spending a quota unit. */
  validate(input: PublishInput): { ok: boolean; issues: string[]; warnings: string[] };
  publish(input: PublishInput): Promise<PublishResult>;
  /** Optional: live remaining publishing quota, when the platform exposes it. */
  quota?(account: PublishInput["account"], accessToken: string): Promise<{ used: number; total: number } | null>;
};

export function fail(
  code: PublishErrorCode,
  message: string,
  action: string,
  options: { retryable?: boolean; raw?: unknown } = {},
): PublishFailure {
  return { ok: false, code, message, action, retryable: options.retryable ?? false, raw: options.raw };
}
