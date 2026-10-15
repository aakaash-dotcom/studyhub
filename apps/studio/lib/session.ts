import { ownerIdentity, type OwnerIdentity } from "@centum/core";

/**
 * The studio runs as its owner — there is no login page (see @centum/core
 * auth/owner.ts for why, and for what still has to be protected).
 *
 * These two helpers keep their names because they are called from the app shell
 * and pages; they are the single place to put a gate back if this ever stops
 * being a one-person tool.
 */

export async function currentUser(): Promise<OwnerIdentity> {
  return ownerIdentity();
}

export async function requireUser(): Promise<OwnerIdentity> {
  return ownerIdentity();
}
