import fs from "fs";
import path from "path";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merge helper, used by the shadcn-style UI primitives. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Root directory where per-job output files are written on disk. */
export const OUTPUT_ROOT = path.join(process.cwd(), "public", "outputs");

export function jobOutputDir(jobId: string) {
  return path.join(OUTPUT_ROOT, jobId);
}

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Strips markdown code fences some models wrap JSON responses in. */
export function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(stripCodeFence(text)) as T;
  } catch {
    return fallback;
  }
}

/** Downloads a remote asset (e.g. a Cloudinary URL) to a local file path. */
export async function downloadToFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download asset: ${url} (${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, buffer);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
