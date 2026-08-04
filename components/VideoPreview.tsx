"use client";

import * as React from "react";
import { Download, FileText, Hash, Image as ImageIcon, Video } from "lucide-react";
import type { JobResponse } from "@/types";

interface VideoPreviewProps {
  files: JobResponse["files"];
}

const DOWNLOAD_ITEMS = [
  { key: "video" as const, label: "Video", icon: Video },
  { key: "thumbnail" as const, label: "Thumbnail", icon: ImageIcon },
  { key: "caption" as const, label: "Caption", icon: FileText },
  { key: "script" as const, label: "Script", icon: FileText },
  { key: "hashtags" as const, label: "Hashtags", icon: Hash },
];

export function VideoPreview({ files }: VideoPreviewProps) {
  return (
    <div className="flex flex-col gap-6">
      {files.video && (
        <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-xl2 border border-line bg-ink">
          <video
            src={files.video}
            poster={files.thumbnail ?? undefined}
            controls
            className="aspect-[9/16] w-full bg-black"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {DOWNLOAD_ITEMS.map(({ key, label, icon: Icon }) => {
          const href = files[key];
          return (
            <a
              key={key}
              href={href ?? undefined}
              download
              aria-disabled={!href}
              className={
                "flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-3 py-4 text-center transition-colors " +
                (href ? "hover:border-brand hover:bg-brand-light" : "pointer-events-none opacity-40")
              }
            >
              <Icon className="h-5 w-5 text-ink" />
              <span className="text-xs font-medium text-ink">{label}</span>
              <Download className="h-3.5 w-3.5 text-ink-faint" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
