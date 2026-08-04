"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
}

export function GenerateButton({
  onClick,
  isLoading,
  disabled,
  label = "Tạo video ngay",
  loadingLabel = "Đang xử lý...",
}: GenerateButtonProps) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
