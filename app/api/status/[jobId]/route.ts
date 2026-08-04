import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { JobResponse } from "@/types";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    return NextResponse.json({ error: "Không tìm thấy tác vụ." }, { status: 404 });
  }

  const base = `/api/download/${job.id}`;
  const response: JobResponse = {
    id: job.id,
    status: job.status,
    step: job.step,
    errorMessage: job.errorMessage,
    files: {
      video: job.videoPath ? `${base}/video` : null,
      thumbnail: job.thumbnailPath ? `${base}/thumbnail` : null,
      script: job.scriptPath ? `${base}/script` : null,
      caption: job.captionPath ? `${base}/caption` : null,
      hashtags: job.hashtagsPath ? `${base}/hashtags` : null,
    },
  };

  return NextResponse.json(response);
}
