import { v2 as cloudinary } from "cloudinary";
import type { ResourceType, UploadedAsset } from "@/types";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a single file buffer to Cloudinary under the ct-ai-video/ folder.
 * Cloudinary auto-detects image vs video via resource_type: "auto".
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<UploadedAsset> {
  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ct-ai-video",
        resource_type: "auto",
        filename_override: filename,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  const resourceType: ResourceType = result.resource_type === "video" ? "video" : "image";

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType,
    width: result.width,
    height: result.height,
  };
}

export { cloudinary };
