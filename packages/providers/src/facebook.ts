import { fail, type ProviderAdapter } from "./types";

/** Facebook Pages adapter — Sprint 2 of Phase 2 (same Meta app as Instagram). */
export function createFacebookAdapter(): ProviderAdapter {
  return {
    platform: "facebook",
    supportedMediaTypes: ["VIDEO", "IMAGE"],
    validate() {
      return { ok: true, issues: [], warnings: ["Facebook Pages publishing arrives after Instagram + YouTube."] };
    },
    async publish() {
      return fail("not_implemented", "The Facebook adapter is not built yet.", "Use Instagram or YouTube for now.");
    },
  };
}
