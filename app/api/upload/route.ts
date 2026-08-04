import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import type { UploadedAsset } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILES = 12;
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB, covers short vertical clips

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Chưa có tệp nào được chọn." }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Chỉ được tải lên tối đa ${MAX_FILES} tệp.` },
        { status: 400 }
      );
    }

    const assets: UploadedAsset[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Tệp "${file.name}" vượt quá dung lượng cho phép.` },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const asset = await uploadBufferToCloudinary(buffer, file.name);
      assets.push(asset);
    }

    return NextResponse.json({ assets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Tải lên thất bại.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
