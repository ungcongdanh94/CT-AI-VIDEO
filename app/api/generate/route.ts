import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runPipeline } from "@/lib/pipeline";
import { PRODUCT_OPTIONS, STYLE_OPTIONS, type GenerateRequestBody } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: GenerateRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  if (!body.assets || body.assets.length === 0) {
    return NextResponse.json({ error: "Vui lòng tải lên ít nhất 1 hình ảnh hoặc video." }, {
      status: 400,
    });
  }
  if (!PRODUCT_OPTIONS.includes(body.product)) {
    return NextResponse.json({ error: "Sản phẩm không hợp lệ." }, { status: 400 });
  }
  if (!STYLE_OPTIONS.includes(body.style)) {
    return NextResponse.json({ error: "Phong cách không hợp lệ." }, { status: 400 });
  }
  const duration = Number(body.duration) || 15;
  if (duration < 5 || duration > 60) {
    return NextResponse.json(
      { error: "Thời lượng video phải trong khoảng 5-60 giây." },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({
    data: {
      status: "PENDING",
      step: "Đang khởi tạo...",
      product: body.product,
      style: body.style,
      duration,
      assets: body.assets as any,
    },
  });

  // Fire-and-forget: Railway runs this as a persistent Node process, so the
  // pipeline keeps executing after this HTTP response is sent. The browser
  // tracks progress via /api/status/[jobId].
  runPipeline(job.id, { ...body, duration }).catch((err) => {
    console.error(`Pipeline crashed for job ${job.id}:`, err);
  });

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
