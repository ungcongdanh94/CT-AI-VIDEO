import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-white hover:bg-brand shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_-8px_rgba(0,166,81,0.55)]",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
        outline: "border border-line bg-transparent text-ink hover:border-ink/30",
      },
      size: {
        default: "h-12 px-6 text-[15px]",
        lg: "h-14 px-8 text-base",
        sm: "h-9 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
