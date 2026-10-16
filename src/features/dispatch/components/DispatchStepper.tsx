"use client";

import {
  Check,
  Ambulance,
  Navigation,
  HeartHandshake,
  Building2,
  Hospital,
  CheckCircle2,
} from "lucide-react";
import { DispatchStatus } from "@/types/entities.types";
import { cn } from "@/lib/utils";

interface DispatchStepperProps {
  currentStatus: DispatchStatus;
  className?: string;
  variant?: "full" | "compact";
}

const STEPS = [
  {
    status: DispatchStatus.DISPATCHED,
    label: "Dispatched",
    desc: "Unit Assigned",
    icon: Ambulance,
  },
  {
    status: DispatchStatus.EN_ROUTE,
    label: "En Route",
    desc: "Approaching Pickup",
    icon: Navigation,
  },
  {
    status: DispatchStatus.PATIENT_PICKUP,
    label: "On Scene",
    desc: "Patient Secured",
    icon: HeartHandshake,
  },
  {
    status: DispatchStatus.HOSPITAL_SELECTED,
    label: "ER Selected",
    desc: "Trauma Bay Notified",
    icon: Building2,
  },
  {
    status: DispatchStatus.HOSPITAL_ARRIVAL,
    label: "Hospital Arrival",
    desc: "At Emergency Bay",
    icon: Hospital,
  },
  {
    status: DispatchStatus.COMPLETED,
    label: "Completed",
    desc: "Handover Finalized",
    icon: CheckCircle2,
  },
];

const STATUS_ORDER: Record<DispatchStatus, number> = {
  [DispatchStatus.DISPATCHED]: 0,
  [DispatchStatus.EN_ROUTE]: 1,
  [DispatchStatus.PATIENT_PICKUP]: 2,
  [DispatchStatus.HOSPITAL_SELECTED]: 3,
  [DispatchStatus.HOSPITAL_ARRIVAL]: 4,
  [DispatchStatus.COMPLETED]: 5,
};

export function DispatchStepper({
  currentStatus,
  className,
  variant = "full",
}: DispatchStepperProps) {
  const currentStepIndex = STATUS_ORDER[currentStatus] ?? 0;

  if (variant === "compact") {
    const currentStep = STEPS[currentStepIndex] || STEPS[0];
    const CurrentIcon = currentStep.icon;

    return (
      <div className={cn("w-full space-y-3 py-1", className)}>
        {/* Progress rail with step nodes */}
        <div className="relative flex items-center justify-between px-1">
          {/* Background rail */}
          <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-1 bg-border/70 rounded-full z-0">
            <div
              className="h-full bg-emergency rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* 6 Step Nodes */}
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <div
                key={step.status}
                title={`${step.label}: ${step.desc}`}
                className={cn(
                  "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                  isCompleted &&
                    "bg-success text-white shadow-xs",
                  isCurrent &&
                    "bg-emergency text-emergency-foreground ring-4 ring-emergency/30 shadow-md scale-110",
                  isUpcoming &&
                    "bg-surface border-2 border-border text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-3" />
                ) : (
                  <span className="text-[10px] font-mono">{idx + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Focus Highlight */}
        <div className="flex items-center justify-between pt-0.5 px-0.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emergency/15 text-emergency">
              <CurrentIcon className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {currentStep.label}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium block leading-tight">
                {currentStep.desc}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-muted-foreground bg-surface px-2 py-0.5 rounded-full border border-border">
            Stage {currentStepIndex + 1} of {STEPS.length}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative">
        {/* Connecting track line for desktop */}
        <div className="hidden md:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-border/80 z-0">
          <div
            className="h-full bg-emergency transition-all duration-500 ease-in-out"
            style={{
              width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps container */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <div
                key={step.status}
                className={cn(
                  "flex items-center md:flex-col md:text-center gap-3 md:gap-2 group",
                  isCurrent && "scale-105 transition-transform",
                )}
              >
                {/* Node icon pill */}
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 shadow-sm",
                    isCompleted &&
                      "bg-success/20 border-success-ink/40 text-success-ink",
                    isCurrent &&
                      "bg-emergency text-emergency-foreground border-emergency ring-4 ring-emergency/25 shadow-lg shadow-emergency/40",
                    isUpcoming &&
                      "bg-surface border-border text-muted-foreground opacity-60",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-3 text-success-ink" />
                  ) : isCurrent ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Text information */}
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-bold transition-colors leading-tight",
                      isCurrent && "text-emergency",
                      isCompleted && "text-foreground",
                      isUpcoming && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium leading-tight mt-0.5">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
