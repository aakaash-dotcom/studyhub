import { env } from "@centum/core";
import { resolvePublicUrl } from "./helpers";
import { validateAssetFor } from "./validation";
import { fail, type ProviderAdapter, type PublishInput, type PublishResult } from "./types";

/**
 * Instagram adapter — container → poll → publish.
 * Implemented fully in Sprint 4; the shape is fixed now so the queue, failures
 * screen and tests can be built against it.
 */
export function createInstagramAdapter(): ProviderAdapter {
  return {
    platform: "instagram",
    supportedMediaTypes: ["REEL", "IMAGE", "CAROUSEL", "STORY"],
    validate(input) {
      const issues: string[] = [];
      const warnings: string[] = [];
      if (input.account.authPath === "instagram_login") {
        // noop: both auth paths publish identically, only the host + scopes differ
      }
      for (const asset of input.assets) {
        const result = validateAssetFor("instagram", input.mediaType, asset);
        issues.push(...result.issues, ...result.issues.length ? [] : []);
        warnings.push(...result.warnings);
      }
      if (input.mediaType === "CAROUSEL" && input.assets.length > 10) {
        issues.push("Instagram carousels are limited to 10 items through the API.");
      }
      return { ok: issues.length === 0, issues, warnings };
    },
    async publish(input: PublishInput): Promise<PublishResult> {
      void env();
      void resolvePublicUrl;
      return fail(
        "not_implemented",
        "The live Instagram adapter lands in Sprint 4.",
        "Set PROVIDER_MODE=mock to exercise the whole pipeline meanwhile.",
      );
    },
  };
}
