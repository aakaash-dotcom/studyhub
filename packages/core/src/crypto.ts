import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/**
 * Token encryption at rest (AES-256-GCM) and password hashing (scrypt).
 *
 * The key comes from TOKEN_ENCRYPTION_KEY. In development — where the key is
 * usually unset — we derive a deterministic dev key so a fresh clone works
 * without ceremony. In production a missing key is a hard error: storing
 * platform tokens in plaintext is not an option.
 */

function encryptionKey(): Buffer {
  const raw = env().TOKEN_ENCRYPTION_KEY;
  if (raw && /^[0-9a-f]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  if (raw && raw.length >= 32) return createHash("sha256").update(raw).digest();
  if (env().NODE_ENV === "production") {
    throw new Error("TOKEN_ENCRYPTION_KEY is required in production (32-byte hex). See .env.example.");
  }
  return createHash("sha256").update("centum-studio-dev-only-key").digest();
}

/** Returns "v1:<iv-b64>:<tag-b64>:<ciphertext-b64>" — self-describing so keys can rotate later. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(payload: string): string {
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== "v1") throw new Error("Not a v1 ciphertext payload");
  const [, ivB64, tagB64, dataB64] = parts as [string, string, string, string];
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltB64, hashB64] = parts as [string, string, string];
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptSync(password, Buffer.from(saltB64, "base64"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Opaque tokens (sessions, API keys, approval links) are stored hashed. */
export function newOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function signPayload(value: string, secret = encryptionKey()): string {
  return createHash("sha256").update(`${value}.${secret.toString("hex")}`).digest("base64url");
}
