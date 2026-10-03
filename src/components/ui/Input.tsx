import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {label}
            {props.required && <span className="text-emergency ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full rounded-md border border-border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              (rightIcon || error) && "pr-10",
              error &&
                "border-rose-500/80 focus-visible:ring-rose-500 bg-rose-500/5",
              className,
            )}
            {...props}
          />

          {error ? (
            <div className="pointer-events-none absolute right-3 flex items-center text-rose-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          ) : (
            rightIcon && (
              <div className="absolute right-3 flex items-center text-muted-foreground">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {/* Inline validation error display per STANDARDS.md Section 7 */}
        {error ? (
          <p className="text-xs font-medium text-rose-500 animate-in fade-in-50 duration-150">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
