import { env } from "@centum/core";
import type { Platform } from "@centum/core";
import { createMockAdapter } from "./mock";
import { createInstagramAdapter } from "./instagram";
import { createYoutubeAdapter } from "./youtube";
import { createFacebookAdapter } from "./facebook";
import type { ProviderAdapter } from "./types";

/**
 * The single place the app asks "who publishes to X?".
 * PROVIDER_MODE=live swaps mock → real, per platform, with no other change.
 */
const cache = new Map<Platform, ProviderAdapter>();

export function providerFor(platform: Platform): ProviderAdapter {
  const cached = cache.get(platform);
  if (cached) return cached;

  const adapter =
    env().PROVIDER_MODE === "mock"
      ? createMockAdapter(platform)
      : platform === "instagram"
        ? createInstagramAdapter()
        : platform === "youtube"
          ? createYoutubeAdapter()
          : createFacebookAdapter();

  cache.set(platform, adapter);
  return adapter;
}

export function allProviders(): ProviderAdapter[] {
  return (["instagram", "youtube", "facebook"] as Platform[]).map(providerFor);
}
