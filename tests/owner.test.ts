import { test } from "node:test";
import assert from "node:assert/strict";
import { OWNER_ACTOR, ownerIdentity } from "@centum/core";

/**
 * The studio has no login page: it runs as its owner. These tests pin the two
 * parts that matter — the identity is always available (so no page can bounce a
 * visitor to a login screen that no longer exists), and the audit trail still
 * attributes writes to a named human.
 */

test("an owner identity is always available", () => {
  const owner = ownerIdentity();
  assert.equal(owner.role, "owner");
  assert.ok(owner.id.length > 0);
  assert.ok(owner.email.includes("@"));
});

test("audit events are still attributable to a person", () => {
  assert.match(OWNER_ACTOR, /^human:/);
  assert.equal(OWNER_ACTOR, "human:owner");
});
