import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "emergency"
  | "warning"
  | "outline"
  | "secondary";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  pulse?: boolean;
  dot?: boolean;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  emergency: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  outline: "border-border bg-transparent text-muted-foreground",
  secondary: "bg-surface-raised text-foreground border-border",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-blue-400",
  success: "bg-emerald-400",
  emergency: "bg-rose-500",
  warning: "bg-amber-400",
  outline: "bg-slate-400",
  secondary: "bg-slate-300",
};

export function Badge({
  className,
  variant = "default",
  size = "md",
  pulse = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-full select-none",
        variantStyles[variant],
        size === "sm" ? "px-2 py-0.5 text-[11px] gap-1" : "px-2.5 py-1 text-xs gap-1.5",
        className,
      )}
      {...props}
    >
      {(dot || pulse) && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotColors[variant],
            pulse && "animate-ping opacity-75",
          )}
        />
      )}
      {children}
    </span>
  );
}
