import fs from "fs";
import path from "path";

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
