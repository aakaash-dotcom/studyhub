import { AwsClient } from "aws4fetch";
import { createHash } from "node:crypto";
import { env, log } from "@centum/core";

/**
 * Cloudflare R2 (S3-compatible) uploader for the public media mirror.
 *
 * Meta and YouTube fetch media from a URL we host — Drive links do not work.
 * Paths are random and immutable so a URL, once handed to a platform, cannot be
 * guessed or overwritten.
 */

export type UploadResult = { ok: true; key: string; publicUrl: string } | { ok: false; error: string };

function endpoint(): string {
  const e = env();
  if (e.R2_ENDPOINT) return e.R2_ENDPOINT.replace(/\/$/, "");
  return `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

export function isConfigured(): boolean {
  const e = env();
  return Boolean(e.R2_ACCESS_KEY_ID && e.R2_SECRET_ACCESS_KEY && (e.R2_ACCOUNT_ID || e.R2_ENDPOINT));
}

export function buildKey(input: { fileName: string; kind: "image" | "video"; prefix?: string }): string {
  const random = createHash("sha256").update(`${Date.now()}-${Math.random()}`).digest("hex").slice(0, 24);
  const extension = (input.fileName.split(".").pop() ?? (input.kind === "video" ? "mp4" : "jpg")).toLowerCase().slice(0, 5);
  const folder = input.prefix ?? "media";
  return `${folder}/${new Date().toISOString().slice(0, 10)}/${random}.${extension}`;
}

export async function upload(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
  const e = env();
  if (!isConfigured()) {
    return { ok: false, error: "R2 is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_PUBLIC_BASE_URL." };
  }
  const client = new AwsClient({
    accessKeyId: e.R2_ACCESS_KEY_ID!,
    secretAccessKey: e.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });
  try {
    const response = await client.fetch(`${endpoint()}/${e.R2_BUCKET}/${key}`, {
      method: "PUT",
      body: new Uint8Array(buffer),
      headers: { "content-type": contentType, "content-length": String(buffer.byteLength) },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { ok: false, error: `R2 upload failed (${response.status}): ${text.slice(0, 200)}` };
    }
    const base = (e.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
    return { ok: true, key, publicUrl: `${base}/${key}` };
  } catch (error) {
    log.error({ err: error, key }, "r2 upload error");
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Confirms the URL is really reachable before we hand it to Meta or YouTube. */
export async function verifyPublicUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
