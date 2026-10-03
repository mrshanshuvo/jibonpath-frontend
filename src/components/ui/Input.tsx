"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
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
      required,
      "aria-describedby": ariaDescribedByProp,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy =
      [
        ariaDescribedByProp,
        error ? errorId : null,
        !error && helperText ? helperId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 flex items-center text-muted-foreground"
            >
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "flex h-10 w-full rounded-md border border-border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              (rightIcon || error) && "pr-10",
              error &&
                "border-destructive/80 focus-visible:ring-destructive bg-destructive/5",
              className,
            )}
            {...props}
          />

          {error ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-3 flex items-center text-destructive"
            >
              <AlertCircle className="h-4 w-4" />
            </div>
          ) : (
            rightIcon && (
              <div
                aria-hidden="true"
                className="absolute right-3 flex items-center text-muted-foreground"
              >
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-destructive motion-safe:animate-in motion-safe:fade-in-50 duration-150"
          >
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
