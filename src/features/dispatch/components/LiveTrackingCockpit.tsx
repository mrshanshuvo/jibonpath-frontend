"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Building2,
  Ambulance,
  User,
  Radio,
  Clock,
  ShieldAlert,
  CheckCircle,
  CreditCard,
  MapPin,
  Activity,
  Share2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { ThemeToggle } from "@/components/shared";
import { UserMenu } from "@/components/layout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DispatchStepper } from "./DispatchStepper";
import { LiveTrackingMap } from "./LiveTrackingMap";
import { useDispatchByRequestId } from "../api/dispatch.queries";
import { PaymentGatewayModal } from "@/features/payment";
import { useAuthStore } from "@/stores/auth.store";
import {
  DispatchStatus,
  PaymentStatus,
  type EmergencyRequest,
  type TelemetryTick,
} from "@/types/entities.types";
import { api } from "@/lib/api-client";
import { ROUTES } from "@/config/routes";

interface LiveTrackingCockpitProps {
  requestId: string;
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
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

export function LiveTrackingCockpit({ requestId }: LiveTrackingCockpitProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: dispatch, isLoading } = useDispatchByRequestId(requestId);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [telemetry, setTelemetry] = useState<TelemetryTick | null>(null);
  const [streamConnected, setStreamConnected] = useState(false);
  const [liveStage, setLiveStage] = useState<DispatchStatus | undefined>(
    undefined,
  );
  const [paymentRequest, setPaymentRequest] =
    useState<EmergencyRequest | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  // Sync initial dispatch stage
  useEffect(() => {
    if (dispatch?.status) {
      setLiveStage(dispatch.status);
    }
    if (dispatch?.latestTelemetry) {
      setTelemetry(dispatch.latestTelemetry);
    }
  }, [dispatch]);

  // Connect to SSE telemetry stream
  useEffect(() => {
    if (!dispatch?.id || !accessToken) return;

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
            setTelemetry({
              dispatchId: payload.dispatchId || dispatch.id,
              lat: payload.lat,
              lng: payload.lng,
              heading: payload.heading,
              speedKmh: payload.speedKmh,
              stage: payload.stage,
              updatedAt: payload.updatedAt || new Date().toISOString(),
            });
            if (payload.stage) {
              setLiveStage(payload.stage as DispatchStatus);
            }
          }
        } catch {
          // Ignore JSON parse heartbeats
        }
      };

      eventSource.onerror = () => {
        setStreamConnected(false);
        eventSource?.close();

        if (!fallbackInterval) {
          fallbackInterval = setInterval(async () => {
            try {
              const res = await api.get<{ data: TelemetryTick }>(
                `/dispatches/${dispatch.id}/telemetry/latest`,
              );
              if (res.data) {
                setTelemetry(res.data);
                if (res.data.stage)
                  setLiveStage(res.data.stage as DispatchStatus);
              }
            } catch {
              // Silently retry
            }
          }, 3500);
        }
      };
    } catch {
      setStreamConnected(false);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [dispatch?.id, accessToken]);

  // Dynamic ETA Calculation
  const etaMinutes = useMemo(() => {
    if (!telemetry || !dispatch) return 6;

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

    return Math.max(1, Math.round((distKm / speed) * 60));
  }, [telemetry, dispatch, liveStage]);

  const isPaid = dispatch?.request?.payment?.status === PaymentStatus.SUCCESS;
  const isCompleted =
    liveStage === DispatchStatus.COMPLETED ||
    dispatch?.status === DispatchStatus.COMPLETED;
  const canPay = isCompleted && !isPaid;

  const handleShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Live tracking link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center p-6 bg-surface">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-10 w-10 mx-auto rounded-full border-3 border-emergency border-t-transparent animate-spin" />
          <h3 className="text-base font-bold text-foreground">
            Acquiring Satellite Telemetry Radar...
          </h3>
          <p className="text-xs text-muted-foreground">
            Connecting directly with paramedic dispatch avionics and Dhaka live
            traffic transponders.
          </p>
        </div>
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center p-6 bg-surface">
        <div className="p-8 text-center space-y-4 max-w-md bg-card rounded-3xl border border-border shadow-2xl">
          <ShieldAlert className="h-12 w-12 text-emergency mx-auto" />
          <h2 className="text-lg font-bold text-foreground">
            No Active Dispatch Found
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This emergency request is either waiting for central CAD ambulance
            assignment or has already concluded.
          </p>
          <Link href={ROUTES.patient.root}>
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Requests Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-dvh overflow-hidden bg-surface">
      {/* Floating Top-Right Utilities Bar (Glassmorphic Overlay on Map) */}
      <div className="absolute top-3 right-16 sm:top-4 sm:right-16 z-20 flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl px-3.5 py-1.5 text-xs font-semibold shadow-lg">
          <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span className="text-foreground">DISPATCH TELEMETRY ONLINE</span>
        </div>

        <a
          href="tel:999"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emergency/40 bg-emergency/15 text-danger-ink dark:text-emergency hover:bg-emergency/25 text-xs font-bold transition-all shadow-lg backdrop-blur-xl"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>999 Hotline</span>
        </a>

        <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl px-2 py-1 shadow-lg">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
      {/* 100% Full Viewport Mapbox Canvas (Industry Gold Standard) */}
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
        showOverlays={false}
        sidebarOpen={sidebarOpen}
        className="absolute inset-0 w-full h-full rounded-none border-none shadow-none"
      />

      {/* Docked Full-Height Tactical Cockpit Sidebar (Google Maps / RapidSOS Style) */}
      <aside
        aria-label="Live Mission Radar Cockpit"
        className={cn(
          "absolute top-0 left-0 bottom-0 z-30 w-full sm:w-[420px] h-full bg-card/95 backdrop-blur-2xl border-r border-border/90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Fixed Header of the Sidebar (top: 0) */}
        <div className="shrink-0 flex items-center justify-between border-b border-border/60 p-4 sm:p-5 bg-card/40">
          <Link
            href={ROUTES.patient.root}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Requests</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareLink}
              className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
              title="Share live tracking link"
              aria-label="Share tracking link"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <Badge variant="emergency" size="sm" pulse>
              {streamConnected ? "LIVE STREAM" : "RADAR CONNECTED"}
            </Badge>

            {/* Collapse toggle button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer ml-1"
              title="Collapse mission panel"
              aria-label="Collapse mission panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Mission Dossier Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

        {/* Hero Dynamic ETA Cockpit Banner */}
        <div className="rounded-2xl border border-emergency/40 bg-emergency/10 p-4 text-foreground flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emergency text-emergency-foreground shadow-lg shadow-emergency/30">
              <Ambulance className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emergency block">
                {dispatch.ambulance?.vehicleNumber || "AMBULANCE EN ROUTE"}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground leading-tight">
                {liveStage === DispatchStatus.COMPLETED
                  ? "Mission Completed"
                  : liveStage === DispatchStatus.PATIENT_PICKUP
                    ? "Arrived On Scene"
                    : `Arriving in ~${etaMinutes} mins`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-emergency">
            <Clock className="h-4 w-4 animate-spin text-emergency" style={{ animationDuration: "6s" }} />
          </div>
        </div>

        {/* Live 6-Stage Mission Stepper */}
        <div className="rounded-xl border border-border/70 bg-surface/80 p-3 shadow-2xs">
          <DispatchStepper
            currentStatus={liveStage || dispatch.status}
            variant="compact"
          />
        </div>

        {/* 1-Tap Emergency Hotlines */}
        <div className="grid grid-cols-2 gap-2">
          {dispatch.driver?.user?.phone ? (
            <a href={`tel:${dispatch.driver.user.phone}`} className="w-full">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center text-xs font-bold gap-1.5"
                leftIcon={<Phone className="h-3.5 w-3.5" />}
              >
                Call Driver
              </Button>
            </a>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full text-xs"
            >
              Driver Dispatched
            </Button>
          )}

          <a href="tel:999" className="w-full">
            <Button
              variant="emergency"
              size="sm"
              className="w-full justify-center text-xs font-bold gap-1.5"
              leftIcon={<Phone className="h-3.5 w-3.5" />}
            >
              999 Hotline
            </Button>
          </a>
        </div>

        {/* Post-Mission Payment Settle Fee Banner */}
        {canPay && (
          <div className="rounded-2xl border border-success/40 bg-success-tint p-4 space-y-2.5 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider">
              <CheckCircle className="h-4 w-4" />
              <span>Handover Finalized</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Patient safely delivered to the emergency trauma team. Please
              settle the ambulance transit fee.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full gap-2 font-bold shadow-md cursor-pointer"
              onClick={() => setPaymentRequest(dispatch.request || null)}
              leftIcon={<CreditCard className="h-4 w-4" />}
            >
              {dispatch.request?.payment?.amount
                ? `Settle Trip Fee (৳ ${dispatch.request.payment.amount})`
                : "Settle Trip Fee & Invoice"}
            </Button>
          </div>
        )}

        {/* Collapsible Mission Dossier Toggle */}
        <button
          type="button"
          onClick={() => setDetailsExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground pt-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span>Incident &amp; Trauma Bay Dossier</span>
          </span>
          {detailsExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Mission Dossier Content */}
        {detailsExpanded && (
          <div className="space-y-3 pt-1 text-xs">
            {/* Pickup Location */}
            <div className="rounded-xl border border-border/70 bg-surface/70 p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emergency flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Pickup Location
              </span>
              <p className="font-semibold text-foreground text-xs leading-snug">
                {dispatch.request?.pickupAddress || "Pickup scene"}
              </p>
              {dispatch.request?.description && (
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 mt-1 line-clamp-2">
                  Condition: {dispatch.request.description}
                </p>
              )}
            </div>

            {/* Destination Trauma Bay */}
            <div className="rounded-xl border border-border/70 bg-surface/70 p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Receiving Hospital
              </span>
              <p className="font-semibold text-foreground text-xs leading-snug">
                {dispatch.hospital?.name ||
                  "Dhaka Medical College Hospital (DMCH)"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {dispatch.hospital?.address || "Central Emergency Ward"}
              </p>
            </div>

            {/* Crew Details */}
            <div className="rounded-xl border border-border/70 bg-surface/70 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {dispatch.driver?.user?.name || "Paramedic Unit"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    License: {dispatch.driver?.licenseNumber || "CERT-EM"}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-primary font-bold">
                {dispatch.ambulance?.type || "ALS UNIT"}
              </span>
            </div>
          </div>
        )}
        </div>
      </aside>

      {/* Floating Re-open Button when Collapsed */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 flex items-center gap-3 rounded-2xl border border-border/90 bg-card/95 backdrop-blur-2xl px-4 py-2.5 shadow-2xl text-foreground hover:text-primary transition-all cursor-pointer group"
          title="Open mission cockpit panel"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emergency text-emergency-foreground shadow-md shadow-emergency/30">
            <Ambulance className="h-5 w-5 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-emergency uppercase tracking-wider block">
              {dispatch.ambulance?.vehicleNumber || "AMBULANCE"}
            </span>
            <span className="text-xs font-extrabold leading-tight flex items-center gap-1.5">
              <span>
                {liveStage === DispatchStatus.COMPLETED
                  ? "Completed"
                  : `Arriving in ~${etaMinutes} mins`}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </button>
      )}

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={Boolean(paymentRequest)}
        onClose={() => setPaymentRequest(null)}
        request={paymentRequest}
      />
    </div>
  );
}
