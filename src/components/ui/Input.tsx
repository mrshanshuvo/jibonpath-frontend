"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.ComponentProps<
  typeof InputPrimitive
> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
    const generatedId = React.useId();
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

    const inputNode = (
      <InputPrimitive
        id={inputId}
        ref={ref}
        type={type}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        data-slot="input"
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          leftIcon && "pl-10",
          (rightIcon || error) && "pr-10",
          error &&
            "border-destructive/80 focus-visible:ring-destructive bg-destructive/5",
          className,
        )}
        {...props}
      />
    );

    if (!label && !error && !helperText && !leftIcon && !rightIcon) {
      return inputNode;
    }

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

          {inputNode}

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

export { Input };
