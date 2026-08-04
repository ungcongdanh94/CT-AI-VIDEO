import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CT AI VIDEO — CÔNG THẢNH",
  description:
    "Tạo video quảng cáo cửa nhôm, kính, sắt tự động bằng AI cho CÔNG THẢNH.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-canvas text-ink font-body antialiased">{children}</body>
    </html>
  );
}
