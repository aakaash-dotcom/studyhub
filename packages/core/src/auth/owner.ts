import { env } from "../env";

/**
 * Ownership (single-operator deployment).
 *
 * This studio is run by one person, on their own machine or VPS. A login page
 * would protect nothing — there is no second tenant to separate — while costing
 * a cookie, a session table read and a redirect on every request. So the app has
 * no authentication wall: it acts as the owner, always.
 *
 * What this does NOT remove, and must not:
 *  - the agent API keys (api_keys) that guard the Phase 2 REST/MCP surface,
 *    because an agent token can be pasted somewhere a human never sees;
 *  - the audit trail, which keeps recording who did what.
 *
 * Before this is exposed on a public hostname, put a gate in front of it at the
 * edge (Caddy basic auth, Tailscale, or an SSH tunnel). That is one config line
 * and no application code — see README "Exposing this to the internet".
 */

export const OWNER_ACTOR = "human:owner" as const;

export type OwnerIdentity = {
  id: string;
  email: string;
  name: string;
  role: "owner";
};

export function ownerIdentity(): OwnerIdentity {
  const e = env();
  return {
    id: "owner",
    email: e.ADMIN_EMAIL,
    name: e.ADMIN_NAME || "Owner",
    role: "owner",
  };
}
