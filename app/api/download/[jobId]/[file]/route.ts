import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { jobOutputDir } from "@/lib/utils";

export const runtime = "nodejs";

const FILE_MAP: Record<string, { column: string; filename: string; contentType: string }> = {
  video: { column: "videoPath", filename: "video.mp4", contentType: "video/mp4" },
  thumbnail: { column: "thumbnailPath", filename: "thumbnail.png", contentType: "image/png" },
  script: { column: "scriptPath", filename: "script.txt", contentType: "text/plain; charset=utf-8" },
  caption: { column: "captionPath", filename: "caption.txt", contentType: "text/plain; charset=utf-8" },
  hashtags: {
    column: "hashtagsPath",
    filename: "hashtags.txt",
    contentType: "text/plain; charset=utf-8",
  },
  voice: { column: "voicePath", filename: "voice.mp3", contentType: "audio/mpeg" },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string; file: string } }
) {
  const entry = FILE_MAP[params.file];
  if (!entry) {
    return NextResponse.json({ error: "Loại tệp không hợp lệ." }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: params.jobId } });
  if (!job || !(job as any)[entry.column]) {
    return NextResponse.json({ error: "Tệp chưa sẵn sàng." }, { status: 404 });
  }

  const filePath = path.join(jobOutputDir(job.id), entry.filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Không tìm thấy tệp trên máy chủ." }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);
  const body = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });

  return new NextResponse(body as any, {
    headers: {
      "Content-Type": entry.contentType,
      "Content-Length": String(stat.size),
      "Content-Disposition": `attachment; filename="cong-thanh-${entry.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
