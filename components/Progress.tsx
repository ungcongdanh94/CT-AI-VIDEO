"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { PIPELINE_STEPS, type JobStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProgressProps {
  status: JobStatus;
  step: string | null;
  errorMessage?: string | null;
}

export function Progress({ status, step, errorMessage }: ProgressProps) {
  const currentIndex = PIPELINE_STEPS.findIndex((s) => s.status === status);

  if (status === "FAILED") {
    return (
      <div className="rounded-xl2 border border-red-200 bg-red-50 p-5">
        <p className="font-display text-sm font-medium text-red-700">Có lỗi xảy ra</p>
        <p className="mt-1 text-sm text-red-600">{errorMessage ?? "Vui lòng thử lại."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {PIPELINE_STEPS.map((s, i) => {
        const isDone = currentIndex > i || status === "COMPLETED";
        const isActive = i === currentIndex && status !== "COMPLETED";
        const isPending = i > currentIndex;

        return (
          <div key={s.status} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-[11px] font-medium transition-colors",
                isDone && "border-brand bg-brand text-white",
                isActive && "border-brand text-brand",
                isPending && "border-line text-ink-faint"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>

            <div className="flex-1">
              <p
                className={cn(
                  "text-sm transition-colors",
                  isDone && "text-ink-faint",
                  isActive && "font-medium text-ink",
                  isPending && "text-ink-faint/70"
                )}
              >
                {isActive && step ? step : s.label}
              </p>
              {isActive && (
                <div className="extrusion-rail mt-2">
                  <div className="extrusion-fill animate-extrude" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
