import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 motion-safe:active:scale-98 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm shadow-primary/25",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary shadow-sm shadow-primary/25",
        outline:
          "border-border bg-background hover:bg-surface-raised hover:text-foreground aria-expanded:bg-surface-raised aria-expanded:text-foreground dark:border-border dark:bg-card/40 dark:hover:bg-card/70",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-ring shadow-sm",
        ghost:
          "hover:bg-surface-raised hover:text-foreground aria-expanded:bg-surface-raised aria-expanded:text-foreground dark:hover:bg-surface-raised/60",
        emergency:
          "bg-emergency text-emergency-foreground hover:bg-emergency/90 focus-visible:ring-emergency shadow-lg shadow-emergency/30 font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive shadow-sm",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive shadow-sm",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning shadow-sm font-semibold",
        info: "bg-info text-info-foreground hover:bg-info/90 focus-visible:ring-info shadow-sm",
        success:
          "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-3.5",
        sm: "h-8 gap-1.5 px-3 text-xs",
        md: "h-9 gap-2 px-3.5 text-sm",
        lg: "h-11 gap-2.5 px-5 text-base",
        icon: "size-9 p-0 justify-center",
        "icon-xs": "size-6 p-0 justify-center",
        "icon-sm": "size-7 p-0 justify-center",
        "icon-lg": "size-10 p-0 justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = NonNullable<
  VariantProps<typeof buttonVariants>["size"]
>;

export interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2
              className="h-4 w-4 animate-spin shrink-0"
              aria-hidden="true"
            />
            {size !== "icon" && <span>{loadingText || "Processing…"}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </ButtonPrimitive>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
