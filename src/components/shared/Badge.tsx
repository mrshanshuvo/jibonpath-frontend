import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        secondary: "",
        destructive: "",
        emergency: "",
        danger: "",
        success: "",
        warning: "",
        info: "",
        outline: "border-border bg-transparent text-foreground",
      },
      appearance: {
        tint: "",
        solid: "border-transparent",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs gap-1.5",
        sm: "px-2 py-0.5 text-2xs gap-1",
        md: "px-2.5 py-1 text-xs gap-1.5",
        lg: "px-3 py-1 text-sm gap-2",
      },
    },
    compoundVariants: [
      // Tint appearance (default for telemetry, status badges, secondary indicators)
      {
        variant: ["default", "primary"],
        appearance: "tint",
        class: "border-primary/25 bg-primary/10 text-primary",
      },
      {
        variant: "secondary",
        appearance: "tint",
        class: "border-border bg-surface-raised text-muted-foreground",
      },
      {
        variant: ["emergency", "destructive", "danger"],
        appearance: "tint",
        class: "border-danger-ink/25 bg-danger/10 text-danger-ink",
      },
      {
        variant: "success",
        appearance: "tint",
        class: "border-success-ink/25 bg-success/10 text-success-ink",
      },
      {
        variant: "warning",
        appearance: "tint",
        class: "border-warning-ink/30 bg-warning/15 text-warning-ink",
      },
      {
        variant: "info",
        appearance: "tint",
        class: "border-info-ink/25 bg-info/10 text-info-ink",
      },

      // Solid appearance (used for Patient Priority P1/P2/P3, urgent banners, high-contrast badges)
      {
        variant: ["default", "primary"],
        appearance: "solid",
        class: "bg-primary text-primary-foreground",
      },
      {
        variant: "secondary",
        appearance: "solid",
        class: "bg-secondary text-secondary-foreground",
      },
      {
        variant: ["emergency", "destructive", "danger"],
        appearance: "solid",
        class: "bg-emergency text-emergency-foreground",
      },
      {
        variant: "success",
        appearance: "solid",
        class: "bg-success text-success-foreground",
      },
      {
        variant: "warning",
        appearance: "solid",
        class: "bg-warning text-warning-foreground",
      },
      {
        variant: "info",
        appearance: "solid",
        class: "bg-info text-info-foreground",
      },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "tint",
      size: "default",
    },
  },
);

const dotColors: Record<string, string> = {
  default: "bg-primary",
  primary: "bg-primary",
  secondary: "bg-muted-foreground",
  destructive: "bg-emergency",
  emergency: "bg-emergency",
  danger: "bg-emergency",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  outline: "bg-muted-foreground",
};

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;
export type BadgeAppearance = NonNullable<
  VariantProps<typeof badgeVariants>["appearance"]
>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
}

function Badge({
  className,
  variant = "default",
  appearance = "tint",
  size = "default",
  pulse = false,
  dot = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const showDot = dot || pulse;
  const currentVariant = variant || "default";
  const dotColor = dotColors[currentVariant] || "bg-primary";

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, appearance, size }), className)}
      {...props}
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0 flex items-center">
          {icon}
        </span>
      )}
      {showDot && !icon && (
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
                "absolute inset-0 inline-flex rounded-full opacity-75 animate-ping",
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
