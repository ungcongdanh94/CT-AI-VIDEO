import fs from "fs";
import { openai } from "./openai";
import { ensureDir } from "./fs-utils";
import path from "path";

const TTS_MODEL = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
const TTS_VOICE = process.env.OPENAI_TTS_VOICE ?? "alloy";

/**
 * Step 3: text-to-speech voiceover for the generated script.
 * Returns the mp3 buffer AND writes it straight to `outPath` so callers
 * don't need to juggle buffers before handing the file to ffmpeg.
 */
export async function generateVoiceover(script: string, outPath: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE as any,
    input: script,
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, buffer);

  return buffer;
}
