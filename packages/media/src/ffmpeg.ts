import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { writeFile, unlink, stat } from "node:fs/promises";

const run = promisify(execFile);

/**
 * The Media box's engine (PLAN.md §4.1).
 *
 * ffmpeg is a hard dependency for video. Every function degrades politely when
 * it is missing so the Studio still runs on a machine without it — you simply
 * skip transcoding and get a clear warning in the UI.
 */

export type ProbeResult = {
  ok: boolean;
  error?: string;
  width?: number;
  height?: number;
  durationS?: number;
  bytes?: number;
  mimeType?: string;
  videoCodec?: string;
  audioCodec?: string;
  frameRate?: number;
  hasAudio?: boolean;
};

export async function ffmpegAvailable(): Promise<{ ffmpeg: boolean; ffprobe: boolean }> {
  const check = async (bin: string) => {
    try {
      await run(bin, ["-version"]);
      return true;
    } catch {
      return false;
    }
  };
  const [ffmpeg, ffprobe] = await Promise.all([check("ffmpeg"), check("ffprobe")]);
  return { ffmpeg, ffprobe };
}

export async function probe(filePath: string): Promise<ProbeResult> {
  try {
    const { stdout } = await run("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);
    const data = JSON.parse(stdout) as {
      format?: { duration?: string; size?: string; format_name?: string };
      streams?: Array<{
        codec_type?: string;
        codec_name?: string;
        width?: number;
        height?: number;
        avg_frame_rate?: string;
        sample_rate?: string;
      }>;
    };
    const video = data.streams?.find((s) => s.codec_type === "video");
    const audio = data.streams?.find((s) => s.codec_type === "audio");
    const [num, den] = (video?.avg_frame_rate ?? "0/1").split("/").map(Number);
    const frameRate = den ? (num ?? 0) / den : undefined;
    const fileStat = await stat(filePath);
    return {
      ok: true,
      width: video?.width,
      height: video?.height,
      durationS: data.format?.duration ? Number(data.format.duration) : undefined,
      bytes: Number(data.format?.size ?? fileStat.size),
      mimeType: guessMime(data.format?.format_name, video !== undefined),
      videoCodec: video?.codec_name,
      audioCodec: audio?.codec_name,
      frameRate,
      hasAudio: Boolean(audio),
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function guessMime(formatName: string | undefined, isVideo: boolean): string {
  const name = formatName ?? "";
  if (name.includes("mov") || name.includes("mp4") || name.includes("m4a")) return "video/mp4";
  if (name.includes("jpeg") || name.includes("jpg")) return "image/jpeg";
  if (name.includes("png")) return "image/png";
  return isVideo ? "video/mp4" : "image/jpeg";
}

export type NormaliseOptions = {
  /** 1080x1920 vertical master by default (satisfies Reels + Shorts + TikTok). */
  width?: number;
  height?: number;
  maxDurationS?: number;
  crf?: number;
};

export type NormaliseResult = { ok: true; path: string; bytes: number } | { ok: false; error: string };

/**
 * One vertical master for every platform: 1080×1920, H.264 high profile,
 * yuv420p, AAC 128k/48kHz, faststart. Media that satisfies Instagram's
 * encoding spec satisfies YouTube and Facebook too.
 */
export async function normaliseVertical(inputPath: string, options: NormaliseOptions = {}): Promise<NormaliseResult> {
  const width = options.width ?? 1080;
  const height = options.height ?? 1920;
  const outputPath = join(tmpdir(), `centum-${randomBytes(6).toString("hex")}.mp4`);
  const filters = [
    `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`,
    "setsar=1",
  ].join(",");

  try {
    await run(
      "ffmpeg",
      [
        "-y",
        "-i",
        inputPath,
        "-vf",
        filters,
        "-c:v",
        "libx264",
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "veryfast",
        "-crf",
        String(options.crf ?? 20),
        "-r",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-movflags",
        "+faststart",
        ...(options.maxDurationS ? ["-t", String(options.maxDurationS)] : []),
        outputPath,
      ],
      { maxBuffer: 32 * 1024 * 1024 },
    );
    const info = await stat(outputPath);
    return { ok: true, path: outputPath, bytes: info.size };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Instagram accepts JPEG only for images — convert anything else. */
export async function toJpeg(inputPath: string, quality = 92): Promise<NormaliseResult> {
  const outputPath = join(tmpdir(), `centum-${randomBytes(6).toString("hex")}.jpg`);
  try {
    await run("ffmpeg", ["-y", "-i", inputPath, "-q:v", String(Math.max(1, Math.round((100 - quality) / 3) + 1)), outputPath]);
    const info = await stat(outputPath);
    return { ok: true, path: outputPath, bytes: info.size };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function writeTemp(buffer: Buffer, extension: string): Promise<string> {
  const filePath = join(tmpdir(), `centum-${randomBytes(6).toString("hex")}.${extension}`);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function cleanup(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    /* already gone */
  }
}
