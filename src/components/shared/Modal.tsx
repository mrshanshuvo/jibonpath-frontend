"use client";

import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  /** Prevents backdrop click from closing the modal. */
  preventBackdropClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
}: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className={className}>
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
