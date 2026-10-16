"use client";

import { useEffect, useState, useMemo } from "react";
import {
  X,
  Phone,
  Building2,
  Ambulance,
  User,
  Clock,
  ShieldAlert,
  CheckCircle,
  CreditCard,
  MapPin,
  Activity,
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { DispatchStepper } from "./DispatchStepper";
import { LiveTrackingMap } from "./LiveTrackingMap";
import { useDispatchByRequestId } from "../api/dispatch.queries";
import { useAuthStore } from "@/stores/auth.store";
import {
  DispatchStatus,
  PaymentStatus,
  type EmergencyRequest,
  type TelemetryTick,
} from "@/types/entities.types";
import { api } from "@/lib/api-client";

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId?: string | null;
  onPay?: (request: EmergencyRequest) => void;
}

// Calculate distance in km between two GPS points using Haversine formula
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LiveTrackingModal({
  isOpen,
  onClose,
  requestId,
  onPay,
}: LiveTrackingModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: dispatch, isLoading } = useDispatchByRequestId(
    requestId || undefined,
  );

  const [telemetryOverride, setTelemetryOverride] =
    useState<TelemetryTick | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [liveStageOverride, setLiveStageOverride] = useState<
    DispatchStatus | undefined
  >(undefined);

  const isPaid = dispatch?.request?.payment?.status === PaymentStatus.SUCCESS;
  const liveStage = liveStageOverride ?? dispatch?.status;
  const telemetry = telemetryOverride ?? dispatch?.latestTelemetry ?? null;
  const isCompleted =
    liveStage === DispatchStatus.COMPLETED ||
    dispatch?.status === DispatchStatus.COMPLETED;
  const canPay = isCompleted && !isPaid && Boolean(onPay);

  // Connect to SSE telemetry stream
  useEffect(() => {
    if (!isOpen || !dispatch?.id || !accessToken) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const sseUrl = `${apiUrl}/dispatches/${dispatch.id}/telemetry/stream?token=${encodeURIComponent(accessToken)}`;

    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setStreamConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "telemetry") {
            setTelemetryOverride({
              dispatchId: payload.dispatchId || dispatch.id,
              lat: payload.lat,
              lng: payload.lng,
              heading: payload.heading,
              speedKmh: payload.speedKmh,
              stage: payload.stage,
              updatedAt: payload.updatedAt || new Date().toISOString(),
            });
            if (payload.stage) {
              setLiveStageOverride(payload.stage as DispatchStatus);
            }
          }
        } catch {
          // Ignore JSON parse errors for heartbeats
        }
      };

      eventSource.onerror = () => {
        setStreamConnected(false);
        eventSource?.close();

        // Activate polling fallback if SSE encounters network closure
        if (!fallbackInterval) {
          fallbackInterval = setInterval(async () => {
            try {
              const res = await api.get<{ data: TelemetryTick }>(
                `/dispatches/${dispatch.id}/telemetry/latest`,
              );
              if (res.data) {
                setTelemetryOverride(res.data);
                if (res.data.stage)
                  setLiveStageOverride(res.data.stage as DispatchStatus);
              }
            } catch {
              // Silently retry
            }
          }, 3500);
        }
      };
    } catch {
      queueMicrotask(() => setStreamConnected(false));
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isOpen, dispatch?.id, accessToken]);

  // Compute dynamic ETA
  const etaMinutes = useMemo(() => {
    if (!telemetry || !dispatch) return 6; // Realistic default fallback

    const curLat = telemetry.lat;
    const curLng = telemetry.lng;

    let targetLat = dispatch.request?.pickupLat || 23.758;
    let targetLng = dispatch.request?.pickupLng || 90.39;

    if (
      liveStage === DispatchStatus.HOSPITAL_SELECTED ||
      liveStage === DispatchStatus.HOSPITAL_ARRIVAL
    ) {
      targetLat = dispatch.hospital?.lat || 23.7258;
      targetLng = dispatch.hospital?.lng || 90.3976;
    }

    const distKm = calculateDistanceKm(curLat, curLng, targetLat, targetLng);
    const speed =
      telemetry.speedKmh && telemetry.speedKmh > 10 ? telemetry.speedKmh : 40;

    const mins = Math.round((distKm / speed) * 60);
    return Math.max(1, mins);
  }, [telemetry, dispatch, liveStage]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-tracking-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xl space-y-5 my-8">
        {/* Top Cockpit Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emergency text-emergency-foreground shadow-lg shadow-emergency/30">
              <Ambulance className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emergency">
                  Live Dispatch Radar
                </span>
                <Badge variant="emergency" size="sm" pulse>
                  {streamConnected ? "STREAMING" : "CONNECTED"}
                </Badge>
              </div>
              <h2
                id="live-tracking-title"
                className="text-lg sm:text-xl font-bold text-foreground mt-0.5"
              >
                Ambulance{" "}
                {dispatch?.ambulance?.vehicleNumber || "Unit En Route"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic ETA Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emergency/10 border border-emergency/30 text-emergency font-bold text-xs sm:text-sm">
              <Clock
                className="h-4 w-4 animate-spin text-emergency"
                style={{ animationDuration: "6s" }}
              />
              <span>
                {liveStage === DispatchStatus.COMPLETED
                  ? "Mission Completed"
                  : liveStage === DispatchStatus.PATIENT_PICKUP
                    ? "Ambulance on Scene"
                    : `Arriving in ~${etaMinutes} min`}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-xl border border-border bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              aria-label="Close live tracking view"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">
              Establishing satellite connection with ambulance telemetry...
            </p>
          </div>
        ) : !dispatch ? (
          <div className="py-16 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              No Active Dispatch Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              This request is currently waiting for central triage pairing or
              has already concluded.
            </p>
            <Button variant="outline" size="sm" onClick={onClose}>
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Stage Progress Stepper */}
            <Card className="p-4 bg-surface/60 border-border/60">
              <DispatchStepper currentStatus={liveStage || dispatch.status} />
            </Card>

            {/* Interactive Map with Smooth Marker Gliding */}
            <LiveTrackingMap
              telemetry={telemetry}
              pickup={
                dispatch.request
                  ? {
                      lat: dispatch.request.pickupLat || 23.758,
                      lng: dispatch.request.pickupLng || 90.39,
                      address: dispatch.request.pickupAddress,
                    }
                  : null
              }
              hospital={
                dispatch.hospital
                  ? {
                      lat: dispatch.hospital.lat || 23.7258,
                      lng: dispatch.hospital.lng || 90.3976,
                      name: dispatch.hospital.name,
                    }
                  : null
              }
              vehicleNumber={dispatch.ambulance?.vehicleNumber}
              stage={liveStage || dispatch.status}
            />

            {/* Payment Settlement Banner on Trip Completion */}
            {canPay && dispatch?.request && (
              <div className="rounded-xl border border-success/40 bg-success-tint p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success text-success-foreground">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Mission Handover Finalized
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Patient has safely arrived at the emergency trauma bay.
                      Please settle the transit fee.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onPay?.(dispatch.request!);
                  }}
                  leftIcon={<CreditCard className="h-4 w-4" />}
                >
                  Settle Fee (৳ {dispatch.request.payment?.amount || 1500})
                </Button>
              </div>
            )}

            {/* Patient Incident & Destination Dossier Card */}
            {dispatch.request && (
              <Card className="p-4 bg-surface/80 border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-emergency" />
                    Incident Details &amp; Destination
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Priority: {dispatch.request.priority}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-emergency shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-semibold block">
                        Pickup Location
                      </span>
                      <span className="text-foreground font-medium">
                        {dispatch.request.pickupAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-semibold block">
                        Destination Hospital
                      </span>
                      <span className="text-foreground font-medium">
                        {dispatch.hospital?.name ||
                          "Dhaka Medical College Hospital"}
                      </span>
                    </div>
                  </div>
                </div>

                {dispatch.request.description && (
                  <div className="rounded-lg bg-surface p-2.5 border border-border/50 text-xs text-foreground/90">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Symptoms &amp; Clinical Notes
                    </span>
                    <p>{dispatch.request.description}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Crew, Vehicle, and Emergency Hotlines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paramedic Driver Card */}
              <Card className="p-4 bg-surface border-border/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Paramedic Driver
                    </span>
                    <h4 className="text-sm font-bold text-foreground">
                      {dispatch.driver?.user?.name || "Paramedic Crew"}
                    </h4>
                    <span className="text-xs font-mono text-muted-foreground">
                      License: {dispatch.driver?.licenseNumber || "CERT-EM"}
                    </span>
                  </div>
                </div>

                {dispatch.driver?.user?.phone && (
                  <a href={`tel:${dispatch.driver.user.phone}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Phone className="h-3.5 w-3.5" />}
                    >
                      Call Driver
                    </Button>
                  </a>
                )}
              </Card>

              {/* Destination Hospital Card */}
              <Card className="p-4 bg-surface border-border/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 border border-success/20 flex items-center justify-center text-success font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-success">
                      Destination Emergency Bay
                    </span>
                    <h4 className="text-sm font-bold text-foreground">
                      {dispatch.hospital?.name ||
                        "Dhaka Medical College Hospital (DMCH)"}
                    </h4>
                    <span className="text-xs text-muted-foreground truncate block max-w-48">
                      {dispatch.hospital?.address ||
                        "Central Trauma Department"}
                    </span>
                  </div>
                </div>

                <a href="tel:999">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emergency border-emergency/30 hover:bg-emergency/10"
                    leftIcon={<Phone className="h-3.5 w-3.5 text-emergency" />}
                  >
                    999 ER
                  </Button>
                </a>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
