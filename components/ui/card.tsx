import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(16,24,32,0.04)] sm:p-8",
        className
      )}
      {...props}
    />
  );
}

export { Card };
