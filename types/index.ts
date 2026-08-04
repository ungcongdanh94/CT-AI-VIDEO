export type ResourceType = "image" | "video";

export interface UploadedAsset {
  url: string;
  publicId: string;
  resourceType: ResourceType;
  width?: number;
  height?: number;
}

export type ProductOption =
  | "Xingfa Class A"
  | "Xingfa Class B"
  | "Namsung"
  | "Draho"
  | "CMECH"
  | "Janus"
  | "Candy";

export type StyleOption =
  | "Luxury"
  | "Cinematic"
  | "Modern"
  | "Premium"
  | "Elegant";

export const PRODUCT_OPTIONS: ProductOption[] = [
  "Xingfa Class A",
  "Xingfa Class B",
  "Namsung",
  "Draho",
  "CMECH",
  "Janus",
  "Candy",
];

export const STYLE_OPTIONS: StyleOption[] = [
  "Luxury",
  "Cinematic",
  "Modern",
  "Premium",
  "Elegant",
];

export type JobStatus =
  | "PENDING"
  | "UPLOADING"
  | "ANALYZING"
  | "SCRIPTING"
  | "VOICING"
  | "RENDERING"
  | "COMPLETED"
  | "FAILED";

// Ordered pipeline steps, used to render the progress list in the UI.
export const PIPELINE_STEPS: { status: JobStatus; label: string }[] = [
  { status: "UPLOADING", label: "Đang tải lên..." },
  { status: "ANALYZING", label: "Đang phân tích hình ảnh..." },
  { status: "SCRIPTING", label: "Đang tạo nội dung..." },
  { status: "VOICING", label: "Đang tạo giọng đọc..." },
  { status: "RENDERING", label: "Đang dựng video..." },
  { status: "COMPLETED", label: "Hoàn tất." },
];

export interface GenerateRequestBody {
  assets: UploadedAsset[];
  product: ProductOption;
  style: StyleOption;
  duration: number;
}

export interface JobResponse {
  id: string;
  status: JobStatus;
  step: string | null;
  errorMessage: string | null;
  files: {
    video: string | null;
    thumbnail: string | null;
    script: string | null;
    caption: string | null;
    hashtags: string | null;
  };
}

export interface ImageAnalysis {
  summary: string;
  detectedElements: string[];
}

export interface ScriptBundle {
  script: string;
  captionFb: string;
  captionTt: string;
  hashtags: string[];
  cta: string;
  videoPrompt: string;
}
