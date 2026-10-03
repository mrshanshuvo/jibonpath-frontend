"use client";

import { Button, Modal } from "@/components/ui";
import { Priority } from "@/types/entities.types";
import type { CreateEmergencyRequestInput } from "../types";

export interface ReviewStepProps {
  isOpen: boolean;
  data: CreateEmergencyRequestInput | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.CRITICAL]: "Critical / Resuscitation",
  [Priority.HIGH]: "High Priority / Acute",
  [Priority.MEDIUM]: "Medium / Urgent Care",
  [Priority.LOW]: "Standard / Medical Transfer",
};

export function ReviewStep({
  isOpen,
  data,
  isSubmitting,
  onCancel,
  onConfirm,
}: ReviewStepProps) {
  if (!data) return null;

  const rows: Array<{ label: string; value: string }> = [
    {
      label: "Severity",
      value: PRIORITY_LABELS[data.priority] ?? data.priority,
    },
    { label: "Pickup", value: data.pickupAddress },
    {
      label: "Hospital",
      value: data.hospitalName ?? "Closest Available Emergency Room",
    },
    { label: "Callback", value: data.contactPhone },
  ];

  if (data.description?.trim()) {
    rows.push({ label: "Notes", value: data.description.trim() });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Confirm emergency dispatch"
      description="An ambulance will be dispatched immediately. Review before confirming."
      preventBackdropClose
    >
      <div className="space-y-4">
        <dl className="divide-y divide-border/60 rounded-lg border border-border bg-surface/40">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[100px_1fr] gap-3 px-4 py-3"
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-sm text-foreground break-words">
                {row.value || "—"}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Go back
          </Button>
          <Button
            type="button"
            variant="emergency"
            onClick={onConfirm}
            isLoading={isSubmitting}
            loadingText="Dispatching…"
          >
            Confirm &amp; Dispatch
          </Button>
        </div>
      </div>
    </Modal>
  );
}
