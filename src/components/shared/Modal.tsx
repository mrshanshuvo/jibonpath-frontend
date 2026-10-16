"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "full";
  titleClassName?: string;
  descriptionClassName?: string;
  /** Prevents backdrop click from closing the modal. */
  preventBackdropClose?: boolean;
}

const MODAL_SIZES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm sm:max-w-sm",
  md: "max-w-md sm:max-w-md",
  lg: "max-w-lg sm:max-w-lg",
  xl: "max-w-xl sm:max-w-xl",
  "2xl": "max-w-2xl sm:max-w-2xl",
  "3xl": "max-w-3xl sm:max-w-3xl",
  "4xl": "max-w-4xl sm:max-w-4xl",
  "5xl": "max-w-5xl sm:max-w-5xl lg:max-w-5xl",
  "6xl": "max-w-6xl sm:max-w-6xl lg:max-w-6xl xl:max-w-7xl",
  full: "max-w-[96vw] sm:max-w-[95vw] lg:max-w-[92vw]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size,
  className,
  titleClassName,
  descriptionClassName,
}: ModalProps) {
  const sizeClass = size ? MODAL_SIZES[size] : undefined;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className={cn(sizeClass, className)}>
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle className={titleClassName}>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription className={descriptionClassName}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
