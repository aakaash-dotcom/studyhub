import type { MediaType, Platform } from "@centum/core";

/**
 * Media specs per platform, as data — so validation is one table, not scattered
 * ifs. Sources: PLAN.md §2.2–2.3 (Meta content publishing docs, YouTube videos
 * reference, verified Oct 2026).
 */

export type MediaSpec = {
  accept: "image" | "video";
  imageFormats?: string[];
  videoFormats?: string[];
  maxBytes: number;
  minDurationS?: number;
  maxDurationS?: number;
  aspect?: { min: number; max: number; recommended: number; note?: string };
  width?: { max?: number; recommended?: number };
  frameRate?: { min: number; max: number };
};

export const SPECS: Record<string, MediaSpec> = {
  "instagram:IMAGE": {
    accept: "image",
    imageFormats: ["image/jpeg"],
    maxBytes: 8 * 1024 * 1024,
    aspect: { min: 0.8, max: 1.91, recommended: 1.0, note: "Feed images must be JPEG, ratio between 4:5 and 1.91:1." },
  },
  "instagram:CAROUSEL": {
    accept: "image",
    imageFormats: ["image/jpeg", "video/mp4"],
    maxBytes: 8 * 1024 * 1024,
    aspect: { min: 0.8, max: 1.91, recommended: 1.0, note: "2–10 items; API limit is 10 (20 is in-app only)." },
  },
  "instagram:REEL": {
    accept: "video",
    videoFormats: ["video/mp4", "video/quicktime"],
    maxBytes: 300 * 1024 * 1024,
    minDurationS: 3,
    maxDurationS: 900,
    aspect: { min: 0.5, max: 2, recommended: 9 / 16, note: "9:16 for the Reels tab; 5–90s gets the widest distribution." },
    width: { max: 1920, recommended: 1080 },
    frameRate: { min: 23, max: 60 },
  },
  "instagram:STORY": {
    accept: "video",
    videoFormats: ["video/mp4", "video/quicktime"],
    maxBytes: 100 * 1024 * 1024,
    minDurationS: 3,
    maxDurationS: 60,
    aspect: { min: 0.5, max: 2, recommended: 9 / 16 },
  },
  "youtube:VIDEO": {
    accept: "video",
    videoFormats: ["video/mp4", "video/quicktime"],
    maxBytes: 256 * 1024 * 1024 * 1024,
    minDurationS: 1,
  },
  "youtube:SHORT": {
    accept: "video",
    videoFormats: ["video/mp4", "video/quicktime"],
    maxBytes: 256 * 1024 * 1024 * 1024,
    minDurationS: 1,
    maxDurationS: 180,
    aspect: { min: 0.5, max: 2, recommended: 9 / 16, note: "Vertical or square, 3 minutes max for Shorts." },
    width: { max: 1920, recommended: 1080 },
  },
  "facebook:VIDEO": {
    accept: "video",
    videoFormats: ["video/mp4", "video/quicktime"],
    maxBytes: 10 * 1024 * 1024 * 1024,
    minDurationS: 1,
  },
  "facebook:IMAGE": { accept: "image", imageFormats: ["image/jpeg", "image/png"], maxBytes: 8 * 1024 * 1024 },
};

export function specFor(platform: Platform, mediaType: MediaType): MediaSpec | null {
  return SPECS[`${platform}:${mediaType}`] ?? null;
}

export type AssetFacts = {
  kind: "image" | "video";
  mimeType: string;
  /** Unknown until ffprobe has run; size checks are skipped when absent. */
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  durationS?: number | null;
};

export type ValidationResult = { ok: boolean; issues: string[]; warnings: string[] };

export function validateAssetFor(platform: Platform, mediaType: MediaType, asset: AssetFacts): ValidationResult {
  const spec = specFor(platform, mediaType);
  if (!spec) {
    return { ok: false, issues: [`Unsupported combination: ${platform} + ${mediaType}`], warnings: [] };
  }
  const issues: string[] = [];
  const warnings: string[] = [];

  if (asset.kind !== spec.accept) {
    issues.push(`${platform} ${mediaType} needs a ${spec.accept}, but this asset is a ${asset.kind}.`);
  }
  const formats = asset.kind === "image" ? spec.imageFormats : spec.videoFormats;
  if (formats && !formats.includes(asset.mimeType)) {
    issues.push(
      `${asset.mimeType || "Unknown format"} is not accepted — use ${formats.join(" or ")}` +
        (spec.accept === "image" && formats.includes("image/jpeg") ? " (Instagram accepts JPEG only; PNG/HEIC must be converted)." : "."),
    );
  }
  if (asset.bytes != null && asset.bytes > spec.maxBytes) {
    issues.push(`File is ${(asset.bytes / 1048576).toFixed(1)} MB; the limit is ${(spec.maxBytes / 1048576).toFixed(0)} MB.`);
  }
  if (spec.minDurationS != null && asset.durationS != null && asset.durationS < spec.minDurationS) {
    issues.push(`Video is ${asset.durationS.toFixed(1)}s; minimum is ${spec.minDurationS}s.`);
  }
  if (spec.maxDurationS != null && asset.durationS != null && asset.durationS > spec.maxDurationS) {
    issues.push(`Video is ${(asset.durationS / 60).toFixed(1)} min; maximum is ${(spec.maxDurationS / 60).toFixed(1)} min.`);
  }
  if (spec.aspect && asset.width && asset.height) {
    const ratio = asset.width / asset.height;
    if (ratio < spec.aspect.min || ratio > spec.aspect.max) {
      issues.push(
        `Aspect ratio ${ratio.toFixed(2)}:1 is outside ${spec.aspect.min}:1–${spec.aspect.max}:1. ${spec.aspect.note ?? ""}`.trim(),
      );
    } else if (Math.abs(ratio - spec.aspect.recommended) > 0.05) {
      warnings.push(`Aspect ratio ${ratio.toFixed(2)}:1 will be cropped or padded. Recommended ${spec.aspect.recommended.toFixed(2)}:1. ${spec.aspect.note ?? ""}`.trim());
    }
  }
  if (spec.width?.recommended && asset.width && asset.width > spec.width.recommended) {
    warnings.push(`Width ${asset.width}px will be downscaled to ${spec.width.recommended}px.`);
  }
  return { ok: issues.length === 0, issues, warnings };
}
