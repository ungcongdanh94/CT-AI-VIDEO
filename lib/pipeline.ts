import path from "path";
import fs from "fs";
import { prisma } from "./db";
import { analyzeImages, generateScriptBundle } from "./openai";
import { generateVoiceover } from "./tts";
import { renderVideo } from "./ffmpeg";
import { downloadToFile, ensureDir, jobOutputDir } from "./utils";
import type { GenerateRequestBody } from "@/types";
import type { JobStatus } from "@prisma/client";

async function setStatus(jobId: string, status: JobStatus, step: string) {
  await prisma.job.update({ where: { id: jobId }, data: { status, step } });
}

/**
 * The whole WORKFLOW from the brief, in one function:
 * upload (already done by /api/upload) -> analyze -> script -> caption ->
 * hashtags -> tts -> ffmpeg assemble -> output files.
 *
 * Runs in the background on the Node server (Railway keeps the process
 * alive, unlike a serverless function), so /api/generate can return
 * immediately and the browser polls /api/status/[jobId] for progress.
 */
export async function runPipeline(jobId: string, body: GenerateRequestBody): Promise<void> {
  const dir = jobOutputDir(jobId);
  const workDir = path.join(dir, "work");
  ensureDir(workDir);

  try {
    // ---- ANALYZE ------------------------------------------------------
    await setStatus(jobId, "ANALYZING", "Đang phân tích hình ảnh...");
    const analysis = await analyzeImages(body.assets);

    // ---- SCRIPT / CAPTION / HASHTAGS / CTA / PROMPT --------------------
    await setStatus(jobId, "SCRIPTING", "Đang tạo nội dung...");
    const bundle = await generateScriptBundle({
      analysis,
      product: body.product,
      style: body.style,
      duration: body.duration,
    });

    const scriptPath = path.join(dir, "script.txt");
    const captionPath = path.join(dir, "caption.txt");
    const hashtagsPath = path.join(dir, "hashtags.txt");

    fs.writeFileSync(scriptPath, bundle.script, "utf-8");
    fs.writeFileSync(
      captionPath,
      `--- Facebook ---\n${bundle.captionFb}\n\n--- TikTok ---\n${bundle.captionTt}\n\n--- CTA ---\n${bundle.cta}`,
      "utf-8"
    );
    fs.writeFileSync(hashtagsPath, bundle.hashtags.join(" "), "utf-8");

    await prisma.job.update({
      where: { id: jobId },
      data: {
        script: bundle.script,
        captionFb: bundle.captionFb,
        captionTt: bundle.captionTt,
        hashtags: bundle.hashtags.join(" "),
        cta: bundle.cta,
        videoPrompt: bundle.videoPrompt,
        scriptPath: "script.txt",
        captionPath: "caption.txt",
        hashtagsPath: "hashtags.txt",
      },
    });

    // ---- VOICE ----------------------------------------------------------
    await setStatus(jobId, "VOICING", "Đang tạo giọng đọc...");
    const voicePath = path.join(dir, "voice.mp3");
    await generateVoiceover(bundle.script, voicePath);
    await prisma.job.update({ where: { id: jobId }, data: { voicePath: "voice.mp3" } });

    // ---- DOWNLOAD SOURCE ASSETS LOCALLY FOR FFMPEG -----------------------
    const localAssets = await Promise.all(
      body.assets.map(async (asset, i) => {
        const ext = asset.resourceType === "video" ? "mp4" : "jpg";
        const localPath = path.join(workDir, `input_${i}.${ext}`);
        await downloadToFile(asset.url, localPath);
        return { filePath: localPath, resourceType: asset.resourceType };
      })
    );

    // ---- RENDER -----------------------------------------------------------
    await setStatus(jobId, "RENDERING", "Đang dựng video...");
    const videoPath = path.join(dir, "video.mp4");
    const thumbnailPath = path.join(dir, "thumbnail.png");

    await renderVideo({
      assets: localAssets,
      voiceoverPath: voicePath,
      duration: body.duration,
      workDir,
      outVideoPath: videoPath,
      outThumbnailPath: thumbnailPath,
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        videoPath: "video.mp4",
        thumbnailPath: "thumbnail.png",
      },
    });

    // ---- DONE ---------------------------------------------------------
    await setStatus(jobId, "COMPLETED", "Hoàn tất.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "FAILED", step: "Thất bại", errorMessage: message },
    });
  } finally {
    // Clean up intermediate render segments, keep the final deliverables.
    fs.rm(workDir, { recursive: true, force: true }, () => undefined);
  }
}
