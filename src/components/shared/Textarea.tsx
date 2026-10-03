"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  /** Show a live `current / max` counter. Requires `maxLength` to be set. */
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCount = false,
      id,
      disabled,
      required,
      maxLength,
      value,
      defaultValue,
      "aria-describedby": ariaDescribedByProp,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? `textarea-${generatedId}`;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const countId = `${textareaId}-count`;

    const describedBy =
      [
        ariaDescribedByProp,
        error ? errorId : null,
        !error && helperText ? helperId : null,
        showCount && maxLength ? countId : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const currentLength =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
          ? defaultValue.length
          : undefined;

    const textareaNode = (
      <div className="relative">
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          data-slot="textarea"
          className={cn(
            "flex field-sizing-content min-h-20 w-full rounded-lg border border-input bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            error &&
              "border-destructive/80 focus-visible:ring-destructive bg-destructive/5",
            className,
          )}
          {...props}
        />
        {error && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 flex items-center text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
    );

    if (!label && !error && !helperText && !showCount) {
      return textareaNode;
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
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

        {textareaNode}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
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
          {showCount && maxLength ? (
            <p
              id={countId}
              className="shrink-0 text-xs text-muted-foreground tabular-nums"
            >
              {currentLength ?? 0} / {maxLength}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
