import type { ProviderAdapter, PublishInput, PublishResult } from "./types";
import { validateAssetFor } from "./validation";

/**
 * The development publisher (PROVIDER_MODE=mock).
 *
 * It runs the SAME validation and returns the same result shape as the real
 * adapters — including plausible failures — so the whole app (composer,
 * scheduler, queue, failures screen) can be built, demoed and tested before a
 * single real credential exists. Flip PROVIDER_MODE=live to swap it out.
 */
export function createMockAdapter(platform: ProviderAdapter["platform"]): ProviderAdapter {
  return {
    platform,
    supportedMediaTypes: platform === "instagram" ? ["REEL", "IMAGE", "CAROUSEL", "STORY"] : ["VIDEO", "SHORT"],
    validate(input: PublishInput) {
      const issues: string[] = [];
      const warnings: string[] = [];
      if (!input.assets.length) issues.push("No media attached.");
      if (!input.caption.trim()) warnings.push("Caption is empty — engagement will be poor.");
      if (input.caption.length > 2200 && platform === "instagram") issues.push("Caption is over Instagram's 2,200 character limit.");
      for (const asset of input.assets) {
        const result = validateAssetFor(platform, input.mediaType, asset);
        issues.push(...result.issues);
        warnings.push(...result.warnings);
      }
      if (platform === "youtube" && (input.options.ytTitle ?? input.caption).length > 100) {
        issues.push("YouTube title must be 100 characters or fewer.");
      }
      return { ok: issues.length === 0, issues, warnings };
    },
    async publish(input: PublishInput): Promise<PublishResult> {
      const validation = this.validate(input);
      if (!validation.ok) {
        return {
          ok: false,
          code: "media_rejected",
          message: validation.issues.join(" "),
          action: "Fix the media or caption and retry.",
          retryable: false,
        };
      }
      // Simulate the real flow's latency and container/polling dance.
      await new Promise((resolve) => setTimeout(resolve, 150));
      const id = `${platform}_mock_${Math.random().toString(36).slice(2, 10)}`;
      const url = `https://example.test/${platform}/${id}`;
      return {
        ok: true,
        remoteId: id,
        remoteUrl: platform === "youtube" ? `https://youtube.com/watch?v=${id}` : url,
        notes: ["Published by the mock adapter (PROVIDER_MODE=mock)."],
      };
    },
    async quota() {
      return { used: 3, total: 25 };
    },
  };
}
