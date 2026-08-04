import OpenAI from "openai";
import type { ImageAnalysis, ScriptBundle, UploadedAsset, ProductOption, StyleOption } from "@/types";
import { safeJsonParse } from "./utils";
import { buildAnalysisPrompt, buildScriptPrompt } from "./prompt";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model name is env-configurable so this project keeps working as OpenAI
// ships newer models - point this at whatever multimodal model your account
// has access to (e.g. "gpt-5.5", "gpt-4o").
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? "gpt-4o";

/**
 * Step 1: AI image understanding.
 * Sends every uploaded image to the Responses API in one call and asks the
 * model to recognize the known scene types (villa, aluminum door, sliding
 * door, showroom, construction site, glass) plus a free-text summary.
 */
export async function analyzeImages(assets: UploadedAsset[]): Promise<ImageAnalysis> {
  const imageAssets = assets.filter((a) => a.resourceType === "image");

  if (imageAssets.length === 0) {
    return {
      summary: "Không có hình ảnh để phân tích, chỉ có video đầu vào.",
      detectedElements: [],
    };
  }

  const response = await openai.responses.create({
    model: TEXT_MODEL,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: buildAnalysisPrompt() },
          ...imageAssets.map((asset) => ({
            type: "input_image" as const,
            image_url: asset.url,
            detail: "auto" as const,
          })),
        ],
      },
    ],
  });

  const text = response.output_text ?? "{}";
  return safeJsonParse<ImageAnalysis>(text, {
    summary: text,
    detectedElements: [],
  });
}

/**
 * Step 2: script + caption + hashtag + CTA + video-prompt generation.
 * Everything is written in Vietnamese, tuned for the chosen product/style.
 */
export async function generateScriptBundle(params: {
  analysis: ImageAnalysis;
  product: ProductOption;
  style: StyleOption;
  duration: number;
}): Promise<ScriptBundle> {
  const response = await openai.responses.create({
    model: TEXT_MODEL,
    input: [
      {
        role: "user",
        content: [{ type: "input_text", text: buildScriptPrompt(params) }],
      },
    ],
  });

  const text = response.output_text ?? "{}";
  return safeJsonParse<ScriptBundle>(text, {
    script: text,
    captionFb: "",
    captionTt: "",
    hashtags: [],
    cta: "Liên hệ CÔNG THẢNH ngay hôm nay!",
    videoPrompt: "",
  });
}

