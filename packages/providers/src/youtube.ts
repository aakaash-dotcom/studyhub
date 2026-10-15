import { fail, type ProviderAdapter, type PublishInput, type PublishResult } from "./types";
import { validateAssetFor } from "./validation";

/**
 * YouTube adapter — resumable upload, private + publishAt.
 * Fully implemented in Sprint 5. Until the Google compliance audit passes,
 * every upload is private (PLAN.md §2.3) — the adapter forces that.
 */
export function createYoutubeAdapter(): ProviderAdapter {
  return {
    platform: "youtube",
    supportedMediaTypes: ["VIDEO", "SHORT"],
    validate(input) {
      const issues: string[] = [];
      const warnings: string[] = [];
      for (const asset of input.assets) {
        const result = validateAssetFor("youtube", input.mediaType, asset);
        issues.push(...result.issues);
        warnings.push(...result.warnings);
      }
      const title = input.options.ytTitle ?? input.caption.split("\n")[0] ?? "";
      if (title.length > 100) issues.push("YouTube title must be ≤100 characters.");
      if ((input.options.ytDesc ?? input.caption).length > 5000) issues.push("YouTube description must be ≤5,000 characters.");
      warnings.push("Uploads stay private until the YouTube API compliance audit is approved.");
      return { ok: issues.length === 0, issues, warnings };
    },
    async publish(input: PublishInput): Promise<PublishResult> {
      void input;
      return fail(
        "not_implemented",
        "The live YouTube adapter lands in Sprint 5.",
        "Set PROVIDER_MODE=mock to exercise the whole pipeline meanwhile.",
      );
    },
  };
}
