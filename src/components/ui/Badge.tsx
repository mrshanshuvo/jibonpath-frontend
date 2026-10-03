import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary",
        primary: "border-primary/20 bg-primary/10 text-primary",
        secondary: "border-border bg-surface-raised text-foreground",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
        emergency: "border-emergency/20 bg-emergency/10 text-emergency",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        info: "border-info/20 bg-info/10 text-info",
        outline: "border-border bg-transparent text-muted-foreground",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs gap-1.5",
        sm: "px-2 py-0.5 text-2xs gap-1",
        md: "px-2.5 py-1 text-xs gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const dotColors: Record<string, string> = {
  default: "bg-primary",
  primary: "bg-primary",
  secondary: "bg-muted-foreground",
  destructive: "bg-destructive",
  emergency: "bg-emergency",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  outline: "bg-muted-foreground",
};

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
  dot?: boolean;
}

function Badge({
  className,
  variant = "default",
  size = "default",
  pulse = false,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const showDot = dot || pulse;
  const currentVariant = variant || "default";
  const dotColor = dotColors[currentVariant] || "bg-primary";

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {showDot && (
        <span
          aria-hidden="true"
          className="relative inline-flex h-1.5 w-1.5 shrink-0"
        >
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              dotColor,
            )}
          />
          {pulse && (
            <span
              className={cn(
                "absolute inset-0 inline-flex rounded-full opacity-75 motion-safe:animate-ping",
                dotColor,
              )}
            />
          )}
        </span>
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
