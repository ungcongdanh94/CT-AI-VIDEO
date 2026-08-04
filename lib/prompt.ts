import type { ImageAnalysis, ProductOption, StyleOption } from "@/types";

const KNOWN_SCENES = [
  "Biệt thự sang trọng (Luxury Villa)",
  "Cửa nhôm (Aluminum Door)",
  "Cửa lùa / cửa trượt (Sliding Door)",
  "Showroom trưng bày",
  "Công trình xây dựng (Construction Site)",
  "Kính (Glass)",
];

export function buildAnalysisPrompt(): string {
  return `Bạn là chuyên gia phân tích hình ảnh cho ngành nhôm kính - cửa nhôm cao cấp.
Hãy xem tất cả hình ảnh được cung cấp và nhận diện các yếu tố sau nếu xuất hiện:
${KNOWN_SCENES.map((s) => `- ${s}`).join("\n")}

Trả lời DUY NHẤT bằng một object JSON hợp lệ, không thêm markdown, không thêm giải thích, theo đúng cấu trúc:
{
  "summary": "Mô tả ngắn gọn (2-3 câu) bằng tiếng Việt về nội dung các hình ảnh, tập trung vào sản phẩm nhôm kính và không gian.",
  "detectedElements": ["liệt kê các yếu tố nhận diện được từ danh sách trên, bằng tiếng Việt"]
}`;
}

export function buildScriptPrompt(params: {
  analysis: ImageAnalysis;
  product: ProductOption;
  style: StyleOption;
  duration: number;
}): string {
  const { analysis, product, style, duration } = params;

  return `Bạn là chuyên gia sáng tạo nội dung marketing cho công ty CÔNG THẢNH, chuyên sản xuất và phân phối cửa nhôm, kính, sắt cao cấp (thương hiệu ${product}).

Thông tin từ hình ảnh/video khách hàng cung cấp:
"${analysis.summary}"
Yếu tố nhận diện: ${analysis.detectedElements.join(", ") || "không xác định"}

Yêu cầu video quảng cáo:
- Thương hiệu sản phẩm: ${product}
- Phong cách: ${style} (sang trọng, điện ảnh, hiện đại, cao cấp, tinh tế)
- Thời lượng: ${duration} giây

Hãy tạo toàn bộ nội dung bằng TIẾNG VIỆT, trả lời DUY NHẤT bằng một object JSON hợp lệ, không markdown, theo đúng cấu trúc:
{
  "script": "Lời bình video (voiceover) súc tích, khớp với thời lượng ${duration} giây khi đọc với tốc độ tự nhiên, phong cách ${style}, nhấn mạnh chất lượng và uy tín của CÔNG THẢNH.",
  "captionFb": "Caption đăng Facebook, có mở đầu thu hút, thân bài ngắn, kêu gọi hành động.",
  "captionTt": "Caption đăng TikTok, ngắn gọn, bắt trend, dùng emoji phù hợp.",
  "hashtags": ["#danhsach", "#hashtag", "#lienquan"],
  "cta": "Một câu kêu gọi hành động ngắn, ví dụ liên hệ CÔNG THẢNH.",
  "videoPrompt": "Mô tả ngắn (bằng tiếng Anh) về không khí, ánh sáng, chuyển động camera mong muốn cho video, dùng để định hướng dựng hình."
}`;
}
