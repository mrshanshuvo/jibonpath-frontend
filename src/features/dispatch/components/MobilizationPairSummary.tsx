"use client";

import { Zap, Siren } from "lucide-react";
import { type Ambulance, type Driver } from "@/types/entities.types";
import { Button } from "@/components/shared";

export interface MobilizationPairSummaryProps {
  activeAmbulance?: Ambulance;
  activeDriver?: Driver;
  isSubmitting: boolean;
  onConfirm: () => void;
  className?: string;
  buttonLabel?: string;
}

export function MobilizationPairSummary({
  activeAmbulance,
  activeDriver,
  isSubmitting,
  onConfirm,
  className,
  buttonLabel = "Confirm & Mobilize Siren",
}: MobilizationPairSummaryProps) {
  const canMobilize = Boolean(activeAmbulance?.id && activeDriver?.id);

  return (
    <div
      className={
        className ||
        "rounded-2xl border-2 border-primary/40 bg-card p-5 space-y-4 shadow-lg shadow-primary/5"
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span>Selected Mobilization Pair</span>
        </h3>
        <span className="text-xs font-bold text-success-ink dark:text-success bg-success-tint px-2.5 py-0.5 rounded-full border border-success/30">
          Ready To Mobilize
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface/80 p-3 rounded-xl border border-border/60">
          <span className="text-xs text-muted-foreground uppercase font-bold block">
            Ambulance
          </span>
          <span className="font-mono font-bold text-sm sm:text-base text-foreground block">
            {activeAmbulance?.vehicleNumber || "Select Unit"}
          </span>
          <span className="text-xs text-primary font-semibold">
            {activeAmbulance?.type || "—"}
          </span>
        </div>

        <div className="bg-surface/80 p-3 rounded-xl border border-border/60">
          <span className="text-xs text-muted-foreground uppercase font-bold block">
            Paramedic Driver
          </span>
          <span className="font-bold text-sm sm:text-base text-foreground truncate block">
            {activeDriver?.user?.name || "Select Driver"}
          </span>
          <span className="text-xs text-muted-foreground font-mono truncate block">
            {activeDriver?.licenseNumber || "—"}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="emergency"
        size="lg"
        disabled={!canMobilize || isSubmitting}
        isLoading={isSubmitting}
        onClick={onConfirm}
        className="w-full gap-2.5 h-12 text-base font-bold shadow-lg shadow-emergency/25 cursor-pointer"
      >
        <Siren className="h-5 w-5 animate-pulse" />
        <span>{buttonLabel}</span>
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Automated traffic siren corridor and hospital telemetry handshake trigger instantly.
      </p>
    </div>
  );
}
