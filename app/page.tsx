"use client";

import * as React from "react";
import { UploadBox } from "@/components/UploadBox";
import { GenerateButton } from "@/components/GenerateButton";
import { Progress } from "@/components/Progress";
import { VideoPreview } from "@/components/VideoPreview";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  PRODUCT_OPTIONS,
  STYLE_OPTIONS,
  type ProductOption,
  type StyleOption,
  type UploadedAsset,
  type JobResponse,
} from "@/types";

type Phase = "idle" | "uploading" | "generating" | "polling" | "completed" | "failed";

const POLL_INTERVAL_MS = 2500;

export default function Home() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [product, setProduct] = React.useState<ProductOption>(PRODUCT_OPTIONS[0]);
  const [style, setStyle] = React.useState<StyleOption>(STYLE_OPTIONS[0]);
  const [duration, setDuration] = React.useState(15);

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [job, setJob] = React.useState<JobResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const isBusy = phase === "uploading" || phase === "generating" || phase === "polling";

  async function handleGenerate() {
    if (files.length === 0) {
      setError("Vui lòng chọn ít nhất 1 hình ảnh hoặc video.");
      return;
    }
    setError(null);
    setJob(null);

    try {
      setPhase("uploading");
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? "Tải lên thất bại.");
      const assets: UploadedAsset[] = uploadData.assets;

      setPhase("generating");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets, product, style, duration }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error ?? "Không thể tạo video.");

      setPhase("polling");
      pollStatus(genData.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
      setPhase("failed");
    }
  }

  function pollStatus(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        const data: JobResponse = await res.json();
        setJob(data);

        if (data.status === "COMPLETED") {
          clearInterval(interval);
          setPhase("completed");
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setPhase("failed");
        }
      } catch {
        // transient network hiccup while polling - keep trying silently
      }
    }, POLL_INTERVAL_MS);
  }

  function handleReset() {
    setFiles([]);
    setJob(null);
    setError(null);
    setPhase("idle");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        <header className="mb-10 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-ink-faint">
              CÔNG THẢNH
            </p>
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            CT AI VIDEO
          </h1>
          <p className="max-w-sm text-sm text-ink-faint">
            Tải ảnh cửa nhôm, kính, sắt lên — AI tự động dựng video quảng cáo hoàn chỉnh.
          </p>
        </header>

        <Card className="flex flex-col gap-8">
          <UploadBox files={files} onChange={setFiles} disabled={isBusy} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Sản phẩm"
              value={product}
              disabled={isBusy}
              onChange={(e) => setProduct(e.target.value as ProductOption)}
            >
              {PRODUCT_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>

            <Select
              label="Phong cách"
              value={style}
              disabled={isBusy}
              onChange={(e) => setStyle(e.target.value as StyleOption)}
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="duration"
                className="text-xs font-medium uppercase tracking-wide text-ink-faint"
              >
                Thời lượng
              </label>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-line bg-surface px-4">
                <input
                  id="duration"
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={duration}
                  disabled={isBusy}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1 accent-brand"
                />
                <span className="w-14 flex-shrink-0 text-right text-sm font-medium text-ink">
                  {duration}s
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {phase === "idle" || phase === "failed" ? (
            <GenerateButton onClick={handleGenerate} isLoading={false} />
          ) : (
            <div className="flex flex-col gap-6">
              <Progress
                status={job?.status ?? "UPLOADING"}
                step={job?.step ?? "Đang tải lên..."}
                errorMessage={job?.errorMessage}
              />
              {phase === "completed" && job && (
                <>
                  <VideoPreview files={job.files} />
                  <GenerateButton onClick={handleReset} isLoading={false} label="Tạo video mới" />
                </>
              )}
            </div>
          )}
        </Card>

        <p className="mt-8 text-center text-xs text-ink-faint">
          CÔNG THẢNH · Nhôm — Kính — Sắt
        </p>
      </div>
    </main>
  );
}
