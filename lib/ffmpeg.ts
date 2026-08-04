import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { ensureDir } from "./fs-utils";
import type { ResourceType } from "@/types";

const FFMPEG_BIN = process.env.FFMPEG_PATH ?? "ffmpeg";
const FFPROBE_BIN = process.env.FFPROBE_PATH ?? "ffprobe";

// 1080x1920 - vertical, tuned for Facebook Reels / TikTok, matches the brief's
// "video quang cao" use case for social-first aluminum door marketing.
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

function run(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${bin} exited with code ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

async function probeDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFPROBE_BIN, [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    let stdout = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.on("error", reject);
    proc.on("close", () => {
      const value = parseFloat(stdout.trim());
      resolve(Number.isFinite(value) ? value : 0);
    });
  });
}

interface LocalAsset {
  filePath: string;
  resourceType: ResourceType;
}

/**
 * Turns one image into a slow Ken Burns zoom/pan clip of `segDuration` seconds.
 * This is the single visual "signature" of the renderer: every still photo of
 * a showroom or villa gets the same cinematic push-in used across the deck.
 */
async function renderImageSegment(
  imagePath: string,
  outPath: string,
  segDuration: number
): Promise<void> {
  const frames = Math.max(1, Math.round(segDuration * FPS));
  const zoomFilter =
    `scale=${WIDTH * 2}:${HEIGHT * 2}:force_original_aspect_ratio=increase,` +
    `crop=${WIDTH * 2}:${HEIGHT * 2},` +
    `zoompan=z='min(zoom+0.0012,1.15)':d=${frames}:s=${WIDTH}x${HEIGHT}:fps=${FPS},` +
    `format=yuv420p`;

  await run(FFMPEG_BIN, [
    "-y",
    "-loop",
    "1",
    "-i",
    imagePath,
    "-t",
    String(segDuration),
    "-vf",
    zoomFilter,
    "-r",
    String(FPS),
    "-an",
    outPath,
  ]);
}

/** Trims/scales an uploaded video clip down to `segDuration` seconds. */
async function renderVideoSegment(
  videoPath: string,
  outPath: string,
  segDuration: number
): Promise<void> {
  const scaleFilter =
    `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,` +
    `crop=${WIDTH}:${HEIGHT},format=yuv420p`;

  await run(FFMPEG_BIN, [
    "-y",
    "-i",
    videoPath,
    "-t",
    String(segDuration),
    "-vf",
    scaleFilter,
    "-r",
    String(FPS),
    "-an",
    outPath,
  ]);
}

/**
 * Full render pipeline:
 *  1. Slice the requested `duration` evenly across every uploaded asset.
 *  2. Render each asset into a same-format .mp4 segment (image => Ken Burns,
 *     video => scaled/cropped/trimmed).
 *  3. Concatenate all segments with the concat demuxer.
 *  4. Mux in the AI voiceover track.
 *  5. Grab a representative frame as the thumbnail.
 */
export async function renderVideo(params: {
  assets: LocalAsset[];
  voiceoverPath: string;
  duration: number;
  workDir: string;
  outVideoPath: string;
  outThumbnailPath: string;
}): Promise<void> {
  const { assets, voiceoverPath, duration, workDir, outVideoPath, outThumbnailPath } = params;
  ensureDir(workDir);

  if (assets.length === 0) {
    throw new Error("Không có hình ảnh/video nào để dựng.");
  }

  const segDuration = Math.max(1.5, duration / assets.length);
  const segmentPaths: string[] = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const segPath = path.join(workDir, `seg_${String(i).padStart(3, "0")}.mp4`);
    if (asset.resourceType === "image") {
      await renderImageSegment(asset.filePath, segPath, segDuration);
    } else {
      await renderVideoSegment(asset.filePath, segPath, segDuration);
    }
    segmentPaths.push(segPath);
  }

  const concatListPath = path.join(workDir, "concat.txt");
  fs.writeFileSync(
    concatListPath,
    segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")
  );

  const silentVideoPath = path.join(workDir, "silent.mp4");
  await run(FFMPEG_BIN, [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListPath,
    "-c",
    "copy",
    silentVideoPath,
  ]);

  ensureDir(path.dirname(outVideoPath));

  const voiceoverExists = fs.existsSync(voiceoverPath);
  if (voiceoverExists) {
    const videoDuration = await probeDuration(silentVideoPath);
    await run(FFMPEG_BIN, [
      "-y",
      "-i",
      silentVideoPath,
      "-i",
      voiceoverPath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-t",
      String(videoDuration),
      outVideoPath,
    ]);
  } else {
    await run(FFMPEG_BIN, ["-y", "-i", silentVideoPath, "-c", "copy", outVideoPath]);
  }

  ensureDir(path.dirname(outThumbnailPath));
  await run(FFMPEG_BIN, [
    "-y",
    "-i",
    outVideoPath,
    "-ss",
    "00:00:01",
    "-vframes",
    "1",
    outThumbnailPath,
  ]);
}
