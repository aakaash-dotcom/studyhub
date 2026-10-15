/**
 * Media hosts differ per platform: both Meta and YouTube are given a URL and
 * fetch the file themselves. Drive share links do not work — only our own R2
 * public URLs (PLAN.md §4.1, "Media box").
 */
export function resolvePublicUrl(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) return null;
  if (!publicUrl.startsWith("https://")) return null;
  return publicUrl;
}

export function redactToken(token: string | null | undefined): string {
  if (!token) return "(none)";
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}
