import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, id, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={selectId} className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </label>
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "h-12 w-full appearance-none rounded-2xl border border-line bg-surface px-4 pr-10 text-[15px] text-ink transition-colors hover:border-ink/20 focus:border-brand",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
