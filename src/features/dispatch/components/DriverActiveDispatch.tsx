"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ambulance,
  Navigation,
  Activity,
  HeartPulse,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle,
  X,
  MapPin,
  ArrowLeft,
  Banknote,
  Receipt,
  CreditCard,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { ThemeToggle } from "@/components/shared";
import { DispatchStepper } from "./DispatchStepper";
import { TripLogsTimeline } from "./TripLogsTimeline";
import { LiveTrackingMap } from "./LiveTrackingMap";
import {
  DispatchStatus,
  PaymentStatus,
  type Dispatch,
} from "@/types/entities.types";
import { useUpdateDispatchStatus } from "../api/dispatch.queries";
import { useDriverLocationBroadcast } from "../hooks/useDriverLocationBroadcast";
import {
  useConfirmCashPayment,
  usePaymentStatus,
} from "@/features/payment";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

interface DriverActiveDispatchProps {
  dispatch: Dispatch;
}

const NEXT_STATUS_MAP: Record<
  DispatchStatus,
  {
    next: DispatchStatus;
    actionText: string;
    actionVerb: string;
    color: "primary" | "emergency" | "secondary";
  } | null
> = {
  [DispatchStatus.DISPATCHED]: {
    next: DispatchStatus.EN_ROUTE,
    actionText: "Acknowledge & Start Route to Patient",
    actionVerb: "EN ROUTE TO SCENE",
    color: "primary",
  },
  [DispatchStatus.EN_ROUTE]: {
    next: DispatchStatus.PATIENT_PICKUP,
    actionText: "Arrived On Scene — Secure Patient",
    actionVerb: "ON SCENE — SECURE PATIENT",
    color: "emergency",
  },
  [DispatchStatus.PATIENT_PICKUP]: {
    next: DispatchStatus.HOSPITAL_SELECTED,
    actionText: "Hospital Confirmed — Begin Transit",
    actionVerb: "BEGIN TRANSIT TO TRAUMA BAY",
    color: "primary",
  },
  [DispatchStatus.HOSPITAL_SELECTED]: {
    next: DispatchStatus.HOSPITAL_ARRIVAL,
    actionText: "Arrived at Emergency Bay",
    actionVerb: "ARRIVED AT EMERGENCY BAY",
    color: "emergency",
  },
  [DispatchStatus.HOSPITAL_ARRIVAL]: {
    next: DispatchStatus.COMPLETED,
    actionText: "Handover Complete — Close Trip",
    actionVerb: "FINALIZE HANDOVER & CLOSE TRIP",
    color: "secondary",
  },
  [DispatchStatus.COMPLETED]: null,
};

export function DriverActiveDispatch({ dispatch }: DriverActiveDispatchProps) {
  const [note, setNote] = useState("");
  const [triageOpen, setTriageOpen] = useState(false);
  const updateStatusMutation = useUpdateDispatchStatus();
  const confirmCashMutation = useConfirmCashPayment();
  const { data: livePayment } = usePaymentStatus(dispatch.requestId);

  const activePayment = livePayment || dispatch.request?.payment;
  const isPaid = activePayment?.status === PaymentStatus.SUCCESS;
  const fareAmount = activePayment?.amount || 2080;
  const isCash = Boolean(activePayment?.gatewayTxnId?.startsWith("CASH"));

  const pickupCoords =
    dispatch.request?.pickupLat && dispatch.request?.pickupLng
      ? { lat: dispatch.request.pickupLat, lng: dispatch.request.pickupLng }
      : null;

  const hospitalCoords =
    dispatch.hospital?.lat && dispatch.hospital?.lng
      ? { lat: dispatch.hospital.lat, lng: dispatch.hospital.lng }
      : null;

  const { coords, isBroadcasting, isSimulated, toggleSimulated } =
    useDriverLocationBroadcast({
      dispatchId: dispatch.id,
      isActive: dispatch.status !== DispatchStatus.COMPLETED,
      stage: dispatch.status,
      pickupCoords,
      hospitalCoords,
    });

  const nextStep = NEXT_STATUS_MAP[dispatch.status];

  const handleAdvanceStatus = (overrideNote?: string) => {
    if (!nextStep) return;
    updateStatusMutation.mutate({
      id: dispatch.id,
      input: {
        status: nextStep.next,
        note: (overrideNote || note).trim() || undefined,
      },
    });
    setNote("");
  };

  const getWaypointHeader = () => {
    switch (dispatch.status) {
      case DispatchStatus.DISPATCHED:
        return {
          title: "NEW MISSION ASSIGNED",
          target: dispatch.request?.pickupAddress || "Proceed to Vehicle",
          stageBadge: "STAGE 1 OF 6",
          code: "PRIORITY CODE 3",
        };
      case DispatchStatus.EN_ROUTE:
        return {
          title: "EN ROUTE TO SCENE",
          target: dispatch.request?.pickupAddress || "Patient Pickup Scene",
          stageBadge: "STAGE 2 OF 6",
          code: "CODE 3 · SIRENS ACTIVE",
        };
      case DispatchStatus.PATIENT_PICKUP:
        return {
          title: "ARRIVED ON SCENE",
          target: "Securing & Assessing Patient",
          stageBadge: "STAGE 3 OF 6",
          code: "SCENE CONTROL",
        };
      case DispatchStatus.HOSPITAL_SELECTED:
        return {
          title: "TRANSIT TO EMERGENCY TRAUMA BAY",
          target: dispatch.hospital?.name || "Dhaka Medical College Hospital",
          stageBadge: "STAGE 4 OF 6",
          code: "IN-TRANSIT CODE 3",
        };
      case DispatchStatus.HOSPITAL_ARRIVAL:
        return {
          title: "ARRIVED AT EMERGENCY BAY",
          target: "Handover to ER Trauma Team",
          stageBadge: "STAGE 5 OF 6",
          code: "TRAUMA DOCK",
        };
      case DispatchStatus.COMPLETED:
        return {
          title: "MISSION COMPLETED",
          target: "Patient Admitted to Trauma Team",
          stageBadge: "STAGE 6 OF 6",
          code: "STANDBY ROTATION",
        };
      default:
        return {
          title: "ACTIVE EMERGENCY MISSION",
          target: "Dhaka Central Dispatch",
          stageBadge: "ACTIVE",
          code: "TELEMETRY ON",
        };
    }
  };

  const waypoint = getWaypointHeader();

  return (
    <div className="fixed inset-0 z-50 w-screen h-dvh overflow-hidden bg-background flex flex-col select-none">
      {/* 100% Edge-to-Edge Navigation Map Canvas */}
      <LiveTrackingMap
        telemetry={{
          dispatchId: dispatch.id,
          lat: coords.lat,
          lng: coords.lng,
          heading: coords.heading,
          speedKmh: coords.speedKmh,
          stage: dispatch.status,
          updatedAt: new Date().toISOString(),
        }}
        pickup={
          pickupCoords
            ? { ...pickupCoords, address: dispatch.request?.pickupAddress }
            : null
        }
        hospital={
          hospitalCoords
            ? { ...hospitalCoords, name: dispatch.hospital?.name }
            : null
        }
        vehicleNumber={dispatch.ambulance?.vehicleNumber}
        stage={dispatch.status}
        showOverlays={false}
        sidebarOpen={triageOpen}
        className="absolute inset-0 w-full h-full rounded-none border-none shadow-none"
      />

      {/* Floating Top Paramedic Waypoint HUD */}
      <header className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Standby Exit Link & Unit Badge */}
        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.driver.history}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl text-xs font-bold text-muted-foreground hover:text-foreground shadow-xl transition-all cursor-pointer"
            title="Exit cockpit to history"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Standby</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-emergency/40 bg-emergency/15 text-foreground backdrop-blur-2xl shadow-xl">
            <Ambulance className="h-4 w-4 text-emergency animate-pulse" />
            <span className="text-xs font-extrabold uppercase font-mono tracking-wider">
              {dispatch.ambulance?.vehicleNumber || "AMB-ALS"}
            </span>
            <span className="hidden md:inline text-[10px] text-emergency font-bold font-mono">
              ({dispatch.ambulance?.type?.replace(/_/g, " ") || "ALS"})
            </span>
          </div>
        </div>

        {/* Center: Mission Waypoint Banner (High Contrast) */}
        <div className="hidden sm:flex flex-1 max-w-xl mx-auto flex-col items-center justify-center px-4 py-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl text-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emergency">
              {waypoint.code}
            </span>
            <span className="text-muted-foreground text-[10px]">·</span>
            <span className="text-[10px] font-mono font-bold text-muted-foreground">
              {waypoint.stageBadge}
            </span>
          </div>
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground truncate max-w-md mt-0.5">
            {waypoint.title}:{" "}
            <span className="text-muted-foreground font-semibold">
              {waypoint.target}
            </span>
          </h2>
        </div>

        {/* Right: GPS Transponder, Telemetry Speed & Theme */}
        <div className="flex items-center gap-2">
          {/* GPS Simulation Toggle */}
          <button
            type="button"
            onClick={toggleSimulated}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl text-xs font-mono font-bold text-foreground hover:bg-surface-raised shadow-xl transition-all cursor-pointer"
            title="Click to toggle GPS broadcast simulation"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isBroadcasting
                  ? "bg-emerald-500 animate-ping"
                  : "bg-amber-500 animate-pulse",
              )}
            />
            <span className="hidden md:inline">
              {isSimulated ? "SIMULATOR" : "DEVICE GPS"}
            </span>
            <span className="md:hidden">GPS</span>
          </button>

          {/* Speed Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl text-xs font-mono font-extrabold text-foreground shadow-xl">
            <Navigation className="h-3.5 w-3.5 text-info animate-pulse" />
            <span>
              {coords.speedKmh > 0 ? `${coords.speedKmh} km/h` : "Stationary"}
            </span>
            <span className="text-muted-foreground text-[10px]">
              {coords.heading}°
            </span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl p-1.5 shadow-xl">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Floating Left Slide-Over: Patient Triage & Mission Dossier */}
      <aside
        aria-label="Patient Triage Dossier"
        className={cn(
          "absolute top-0 left-0 bottom-0 z-40 w-full sm:w-105 h-full bg-card/95 backdrop-blur-2xl border-r border-border/90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out pointer-events-auto",
          triageOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer Fixed Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-border/60 p-4 sm:p-5 bg-card/50">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emergency" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Patient Triage &amp; Clinical Dossier
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setTriageOpen(false)}
            className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
            title="Close triage panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Mission Stepper */}
          <div className="rounded-2xl border border-border/70 bg-surface/80 p-3.5 shadow-2xs">
            <DispatchStepper
              currentStatus={dispatch.status}
              variant="compact"
            />
          </div>

          {/* Caller / Patient Contact Card */}
          <div className="rounded-2xl border border-border/70 bg-surface/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Caller &amp; Emergency Contact
              </span>
              <Badge variant="primary" size="sm">
                VERIFIED
              </Badge>
            </div>
            <p className="text-sm font-bold text-foreground">
              {dispatch.request?.caller?.name || "Emergency Caller"}
            </p>
            {dispatch.request?.caller?.phone ? (
              <a
                href={`tel:${dispatch.request.caller.phone}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-success hover:underline pt-1"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Caller: {dispatch.request.caller.phone}</span>
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">
                No phone recorded
              </span>
            )}
          </div>

          {/* Pickup & Destination Routing Cards */}
          <div className="space-y-2.5">
            <div className="rounded-2xl border border-emergency/30 bg-emergency/5 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emergency flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Patient Pickup Location
              </span>
              <p className="text-xs font-bold text-foreground leading-snug">
                {dispatch.request?.pickupAddress || "Pickup scene"}
              </p>
              {dispatch.request?.description && (
                <p className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40 mt-1.5">
                  <span className="font-semibold text-foreground">
                    Condition:{" "}
                  </span>
                  {dispatch.request.description}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Destination Trauma Bay
              </span>
              <p className="text-xs font-bold text-foreground leading-snug">
                {dispatch.hospital?.name || "Dhaka Medical College Hospital"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {dispatch.hospital?.address || "Central Emergency Trauma Bay"}
              </p>
            </div>
          </div>

          {/* Trip Billing & Settlement Dossier */}
          <div className="rounded-2xl border border-border/70 bg-surface/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-primary" />
                Trip Billing &amp; Settlement
              </span>
              {isPaid ? (
                <Badge variant="success" size="sm">
                  PAID
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  PENDING SETTLEMENT
                </Badge>
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground font-medium">Authoritative Fare</span>
              <span className="text-base font-extrabold text-foreground font-mono">
                ৳ {fareAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
              {isPaid ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Settled via {isCash ? "Cash at Hospital Bay" : "Stripe Digital Checkout"}
                </span>
              ) : (
                <span className="text-amber-500 font-medium">
                  Awaiting patient digital checkout or cash collection at ER bay
                </span>
              )}
            </div>
          </div>

          {/* Triage Live Telemetry Vitals Simulation */}
          <div className="rounded-2xl border border-border/70 bg-surface/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                <HeartPulse className="h-4 w-4 text-emergency animate-pulse" />
                <span>Patient Triage Vitals Monitor</span>
              </div>
              <span className="text-[10px] font-mono text-success font-bold">
                TELEMETRY ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Heart Rate
                </span>
                <span className="text-base font-extrabold text-foreground mt-0.5 block">
                  78{" "}
                  <span className="text-[10px] text-muted-foreground">bpm</span>
                </span>
              </div>
              <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Blood Press
                </span>
                <span className="text-base font-extrabold text-foreground mt-0.5 block">
                  120/80
                </span>
              </div>
              <div className="bg-background/80 p-2.5 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  SpO2 Sat
                </span>
                <span className="text-base font-extrabold text-emerald-500 mt-0.5 block">
                  98%
                </span>
              </div>
            </div>
          </div>

          {/* Optional Telemetry Transition Note */}
          {nextStep && (
            <div className="rounded-2xl border border-border/70 bg-surface/70 p-4 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Telemetry Log / Note for Next Checkpoint:
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Vitals stable, oxygen administered, IV open..."
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary font-medium"
              />
            </div>
          )}

          {/* Trip Status Logs Timeline */}
          {dispatch.tripStatusLogs && dispatch.tripStatusLogs.length > 0 && (
            <TripLogsTimeline logs={dispatch.tripStatusLogs} />
          )}
        </div>
      </aside>

      {/* Sticky Bottom Emergency Action Deck (Zero-Scroll & Glove-Friendly) */}
      <footer className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-30 pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/95 backdrop-blur-2xl p-3 sm:p-4 rounded-3xl border border-border/90 shadow-2xl">
          {/* Left: Quick Actions Deck */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "h-13 sm:h-14 px-4 text-xs font-bold rounded-2xl gap-2 cursor-pointer shadow-md",
                triageOpen && "bg-surface-raised border-primary text-primary",
              )}
              onClick={() => setTriageOpen((prev) => !prev)}
              leftIcon={<Activity className="h-4 w-4 text-emergency" />}
            >
              <span>{triageOpen ? "Close Dossier" : "Patient Triage"}</span>
            </Button>

            {dispatch.request?.caller?.phone && (
              <a href={`tel:${dispatch.request.caller.phone}`}>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 sm:h-14 px-4 text-xs font-bold rounded-2xl gap-2 cursor-pointer shadow-md"
                  leftIcon={<Phone className="h-4 w-4 text-emerald-500" />}
                >
                  <span className="hidden sm:inline">Call Caller</span>
                  <span className="sm:hidden">Call</span>
                </Button>
              </a>
            )}

            <a href="tel:999">
              <Button
                variant="emergency"
                size="lg"
                className="h-13 sm:h-14 px-4 text-xs font-bold rounded-2xl gap-2 cursor-pointer shadow-md"
                leftIcon={<Phone className="h-4 w-4" />}
              >
                <span>999</span>
              </Button>
            </a>
          </div>

          {/* Right: Massive Glove-Friendly Next Action Trigger & Settlement Terminal */}
          <div className="w-full sm:w-auto flex-1 max-w-xl">
            {dispatch.status === DispatchStatus.HOSPITAL_ARRIVAL ? (
              <div className="flex flex-col gap-2.5 w-full">
                {/* Live Bay Settlement Status Banner */}
                {isPaid ? (
                  <div className="flex items-center justify-between bg-emerald-500/15 border border-emerald-500/35 px-4 py-2 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-foreground">
                        Payment Settled: ৳ {fareAmount.toLocaleString()}{" "}
                        <span className="text-[11px] font-mono text-emerald-500 font-normal">
                          ({isCash ? "CASH COLLECTED AT BAY" : "PAID ONLINE VIA STRIPE"})
                        </span>
                      </span>
                    </div>
                    <Badge variant="success" size="sm">
                      SETTLED
                    </Badge>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-amber-500/10 border border-amber-500/35 p-2.5 sm:px-4 sm:py-2 rounded-2xl gap-2 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                      <span>
                        Fare Due: <span className="font-mono text-amber-500 font-extrabold">৳ {fareAmount.toLocaleString()}</span> · Awaiting Settlement
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8.5 px-3 text-xs font-bold bg-card border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer shadow-xs"
                        isLoading={confirmCashMutation.isPending}
                        onClick={() =>
                          confirmCashMutation.mutate({
                            requestId: dispatch.requestId,
                          })
                        }
                        leftIcon={<Banknote className="h-3.5 w-3.5 text-emerald-500" />}
                      >
                        Confirm Cash (৳{fareAmount})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() =>
                          handleAdvanceStatus(
                            "Patient unaccompanied / deferred — Invoiced to caller account",
                          )
                        }
                        title="Defer billing to patient account and return ambulance to rotation immediately"
                      >
                        Invoice Later
                      </Button>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <Button
                  variant={isPaid ? "primary" : "secondary"}
                  size="lg"
                  className="w-full h-14 sm:h-16 px-6 sm:px-8 text-sm sm:text-base font-black uppercase tracking-wider rounded-2xl shadow-xl justify-center cursor-pointer gap-3 ring-4 ring-emergency/25 animate-in fade-in"
                  isLoading={updateStatusMutation.isPending}
                  onClick={() =>
                    handleAdvanceStatus(
                      isPaid ? "Payment verified and trip closed" : undefined,
                    )
                  }
                >
                  <span>
                    {isPaid
                      ? "FINALIZE RUN & RETURN TO STANDBY"
                      : "FINALIZE HANDOVER (DEFER INVOICE) & CLOSE"}
                  </span>
                  <ArrowRight className="h-5 w-5 stroke-3" />
                </Button>
              </div>
            ) : nextStep ? (
              <Button
                variant={nextStep.color}
                size="lg"
                className="w-full h-14 sm:h-16 px-6 sm:px-8 text-sm sm:text-base font-black uppercase tracking-wider rounded-2xl shadow-xl justify-center cursor-pointer gap-3 ring-4 ring-emergency/25 animate-in fade-in"
                isLoading={updateStatusMutation.isPending}
                onClick={() => handleAdvanceStatus()}
              >
                <span>{nextStep.actionVerb}</span>
                <ArrowRight className="h-5 w-5 stroke-3" />
              </Button>
            ) : (
              <Link href={ROUTES.driver.history} className="w-full block">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full h-14 sm:h-16 px-6 sm:px-8 text-sm sm:text-base font-extrabold rounded-2xl shadow-xl justify-center cursor-pointer gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Mission Finalized · View Trip Logs</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
