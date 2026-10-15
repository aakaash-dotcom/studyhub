import { test } from "node:test";
import assert from "node:assert/strict";
import { decryptSecret, encryptSecret, hashPassword, sha256, verifyPassword } from "@centum/core";

test("tokens round-trip through AES-256-GCM", () => {
  const token = "EAAG-long-lived-instagram-token-1234567890";
  const cipher = encryptSecret(token);
  assert.notEqual(cipher, token);
  assert.ok(cipher.startsWith("v1:"));
  assert.equal(decryptSecret(cipher), token);
});

test("tampered ciphertext is rejected", () => {
  const cipher = encryptSecret("secret");
  const parts = cipher.split(":");
  parts[3] = Buffer.from("tampered").toString("base64");
  assert.throws(() => decryptSecret(parts.join(":")));
});

test("passwords hash and verify", () => {
  const hash = hashPassword("centum-admin");
  assert.ok(hash.startsWith("scrypt:"));
  assert.equal(verifyPassword("centum-admin", hash), true);
  assert.equal(verifyPassword("wrong", hash), false);
});

test("sha256 is stable (session + api-key lookups depend on it)", () => {
  assert.equal(sha256("abc"), sha256("abc"));
  assert.notEqual(sha256("abc"), sha256("abd"));
});
