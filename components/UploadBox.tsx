"use client";

import * as React from "react";
import { UploadCloud, X, Film, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadBoxProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED = "image/*,video/*";
const MAX_FILES = 12;

export function UploadBox({ files, onChange, disabled }: UploadBoxProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files, ...Array.from(incoming)].slice(0, MAX_FILES);
    onChange(next);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed px-6 py-14 text-center transition-colors",
          isDragging ? "border-brand bg-brand-light" : "border-line bg-canvas hover:border-ink/20",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand shadow-[0_1px_2px_rgba(16,24,32,0.06)]">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-[15px] font-medium text-ink">
            Kéo thả hoặc bấm để chọn hình ảnh / video
          </p>
          <p className="mt-1 text-sm text-ink-faint">
            Cửa nhôm, showroom, biệt thự, công trình... (tối đa {MAX_FILES} tệp)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {files.map((file, i) => (
            <Thumbnail key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} disabled={disabled} />
          ))}
        </div>
      )}
    </div>
  );
}

function Thumbnail({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const url = React.useMemo(() => URL.createObjectURL(file), [file]);
  const isVideo = file.type.startsWith("video");

  React.useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-ink/5">
      {isVideo ? (
        <video src={url} className="h-full w-full object-cover" muted />
      ) : (
        <img src={url} alt={file.name} className="h-full w-full object-cover" />
      )}
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-white">
        {isVideo ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Xoá ${file.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
