"use client";

import { useState } from "react";
import {
  Ambulance,
  Navigation,
  Activity,
  HeartPulse,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { DispatchStepper } from "./DispatchStepper";
import { TripLogsTimeline } from "./TripLogsTimeline";
import { DispatchStatus, type Dispatch } from "@/types/entities.types";
import { useUpdateDispatchStatus } from "../api/dispatch.queries";

interface DriverActiveDispatchProps {
  dispatch: Dispatch;
}

const NEXT_STATUS_MAP: Record<
  DispatchStatus,
  {
    next: DispatchStatus;
    actionText: string;
    color: "primary" | "emergency" | "secondary";
  } | null
> = {
  [DispatchStatus.DISPATCHED]: {
    next: DispatchStatus.EN_ROUTE,
    actionText: "Acknowledge & Start Route to Patient",
    color: "primary",
  },
  [DispatchStatus.EN_ROUTE]: {
    next: DispatchStatus.PATIENT_PICKUP,
    actionText: "Arrived On Scene — Secure Patient",
    color: "emergency",
  },
  [DispatchStatus.PATIENT_PICKUP]: {
    next: DispatchStatus.HOSPITAL_SELECTED,
    actionText: "Hospital Confirmed — Begin Transit",
    color: "primary",
  },
  [DispatchStatus.HOSPITAL_SELECTED]: {
    next: DispatchStatus.HOSPITAL_ARRIVAL,
    actionText: "Arrived at Emergency Bay",
    color: "emergency",
  },
  [DispatchStatus.HOSPITAL_ARRIVAL]: {
    next: DispatchStatus.COMPLETED,
    actionText: "Handover Complete — Close Trip",
    color: "secondary",
  },
  [DispatchStatus.COMPLETED]: null,
};

export function DriverActiveDispatch({ dispatch }: DriverActiveDispatchProps) {
  const [note, setNote] = useState("");
  const updateStatusMutation = useUpdateDispatchStatus();

  const nextStep = NEXT_STATUS_MAP[dispatch.status];

  const [swipeStart, setSwipeStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStart === null) return;
    const diff = swipeStart - e.changedTouches[0].clientX;
    if (diff > 60 && nextStep) handleAdvanceStatus(); // swipe left = advance
    setSwipeStart(null);
  };

  const handleAdvanceStatus = () => {
    if (!nextStep) return;
    updateStatusMutation.mutate({
      id: dispatch.id,
      input: {
        status: nextStep.next,
        note: note.trim() || undefined,
      },
    });
    setNote("");
  };

  return (
    <div
      className="space-y-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {dispatch
          ? `Status: ${dispatch.status}. Next action: ${nextStep?.actionText || "Complete"}`
          : "No active dispatch"}
      </div>

      {/* Live Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="h-4 w-4 text-info" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Live GPS
            </h3>
          </div>
          <div className="text-2xl font-extrabold text-foreground">
            23.8103° N
          </div>
          <div className="text-sm text-muted-foreground">
            90.4125° E · Dhaka
          </div>
          <div className="mt-2 text-xs text-success font-medium">
            Moving · 42 km/h
          </div>
        </Card>
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-emergency" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Turn-by-Turn
            </h3>
          </div>
          <div className="text-sm font-medium text-foreground">
            Turn left onto Dhanmondi Rd
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            0.8 km · 2 min
          </div>
          <div className="mt-2 text-xs text-info">
            Next: Hospital Emergency Bay
          </div>
        </Card>
        <Card className="p-4 bg-surface border-border">
          <div className="flex items-center gap-2 mb-3">
            <HeartPulse className="h-4 w-4 text-success" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Patient Vitals
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">72</div>
              <div className="text-3xs text-muted-foreground">HR</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">120/80</div>
              <div className="text-3xs text-muted-foreground">BP</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">98%</div>
              <div className="text-3xs text-muted-foreground">SpO2</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Cockpit Header */}
      <div className="rounded-2xl border border-emergency/40 bg-emergency/10 p-5 sm:p-6 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emergency text-emergency-foreground shadow-lg shadow-emergency/30">
            <Ambulance className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emergency">
                Active Paramedic Mission
              </span>
              <Badge variant="emergency" size="sm" pulse>
                LIVE DISPATCH
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
              Trip #{dispatch.id.slice(0, 8)}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dispatch.request?.caller?.phone && (
            <a href={`tel:${dispatch.request.caller.phone}`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Phone className="h-4 w-4 text-success" />}
              >
                Call Patient: {dispatch.request.caller.phone}
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Visual Live Stepper */}
      <Card className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Telemetry Mission Progress
        </h2>
        <DispatchStepper currentStatus={dispatch.status} />
      </Card>

      {/* Grid: Patient Details & Ambulance Telemetry */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pickup & Destination Locations */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Location Route Coordinates
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-surface p-3.5 border border-border/60">
              <Navigation className="h-5 w-5 shrink-0 text-emergency mt-0.5" />
              <div>
                <span className="text-3xs font-semibold uppercase tracking-wider text-emergency">
                  Patient Pickup Location
                </span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {dispatch.request?.pickupAddress ||
                    "Pickup location not provided"}
                </p>
                {dispatch.request?.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Condition: {dispatch.request.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-surface p-3.5 border border-border/60">
              <Building2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <div>
                <span className="text-3xs font-semibold uppercase tracking-wider text-primary">
                  Destination Emergency Department
                </span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {dispatch.hospital?.name ||
                    "Dhaka Medical College Hospital (DMCH)"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dispatch.hospital?.address || "Emergency Bay Room 104"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Assigned Unit & Crew */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Assigned Vehicle & Paramedic Unit
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface p-3.5 border border-border/60">
              <span className="text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ambulance Reg
              </span>
              <p className="text-sm font-bold text-foreground mt-1">
                {dispatch.ambulance?.vehicleNumber || "DHAKA-EM-104"}
              </p>
              <span className="text-3xs text-primary font-mono mt-0.5 block">
                {dispatch.ambulance?.type || "ADVANCED_LIFE_SUPPORT"}
              </span>
            </div>

            <div className="rounded-xl bg-surface p-3.5 border border-border/60">
              <span className="text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Driver
              </span>
              <p className="text-sm font-bold text-foreground mt-1">
                {dispatch.driver?.user?.name || "Paramedic Crew"}
              </p>
              <span className="text-3xs text-success font-mono mt-0.5 block">
                License: {dispatch.driver?.licenseNumber || "N/A"}
              </span>
            </div>
          </div>

          {/* Quick Note Input */}
          {nextStep && (
            <div className="space-y-1.5 pt-2">
              <label className="block text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
                Telemetry Log / Note for this transition (optional):
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Vitals stable, SpO2 98%, starting IV access..."
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Advance Stage Control Card */}
      {nextStep ? (
        <Card className="p-6 bg-surface-raised border-primary/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-3xs font-bold uppercase tracking-wider text-primary">
                Next Operational Checkpoint
              </span>
              <h4 className="text-lg font-bold text-foreground mt-0.5">
                Advance Status to: {nextStep.next}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Clicking will immediately broadcast telemetry to the central
                dispatch control room and the receiving hospital.
              </p>
            </div>

            <Button
              variant={nextStep.color}
              size="lg"
              className="py-6 px-8 text-base font-bold shadow-xl cursor-pointer"
              isLoading={updateStatusMutation.isPending}
              onClick={handleAdvanceStatus}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              {nextStep.actionText}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-success-tint border-success/30 text-center space-y-2">
          <CheckCircle className="h-10 w-10 text-success-ink dark:text-success mx-auto" />
          <h4 className="text-lg font-bold text-foreground">
            Trip Completed Successfully
          </h4>
          <p className="text-xs text-muted-foreground">
            Patient handed over to emergency trauma team. Vehicle is returning
            to available rotation.
          </p>
        </Card>
      )}

      {/* Real-time Trip Logs Timeline */}
      {dispatch.tripStatusLogs && dispatch.tripStatusLogs.length > 0 && (
        <TripLogsTimeline logs={dispatch.tripStatusLogs} />
      )}
    </div>
  );
}
