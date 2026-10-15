"use client";

import { useState, useSyncExternalStore } from "react";
import { Card, Button, StatusBadge, Skeleton } from "@/components/shared";
import {
  Siren,
  Clock,
  MapPin,
  User,
  Phone,
  Building2,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Zap,
} from "lucide-react";
import {
  Priority,
  RequestStatus,
  type EmergencyRequest,
} from "@/types/entities.types";
import { useAdminRequests } from "../api/emergency.queries";
import { parseRequestDescription } from "./RequestCard";
import { DispatchModal } from "@/features/dispatch";
import { cn } from "@/lib/utils";

let currentTimestamp = 0;
const tickerListeners = new Set<() => void>();
let tickerIntervalId: ReturnType<typeof setInterval> | null = null;

function subscribeTicker(callback: () => void) {
  tickerListeners.add(callback);
  if (!tickerIntervalId) {
    currentTimestamp = Date.now();
    tickerIntervalId = setInterval(() => {
      currentTimestamp = Date.now();
      tickerListeners.forEach((listener) => listener());
    }, 1000);
  }
  return () => {
    tickerListeners.delete(callback);
    if (tickerListeners.size === 0 && tickerIntervalId) {
      clearInterval(tickerIntervalId);
      tickerIntervalId = null;
    }
  };
}

function getTickerSnapshot() {
  if (currentTimestamp === 0 && typeof window !== "undefined") {
    currentTimestamp = Date.now();
  }
  return currentTimestamp;
}

function getServerTickerSnapshot() {
  return 0;
}

function formatElapsedTime(
  createdAt: string,
  now: number,
): {
  text: string;
  isSlaExceeded: boolean;
} {
  if (now === 0) {
    return { text: "Just now", isSlaExceeded: false };
  }
  const createdTime = new Date(createdAt).getTime();
  const diffMs = Math.max(0, now - createdTime);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const isSlaExceeded = minutes >= 5;

  if (minutes === 0) {
    return { text: `${seconds}s ago`, isSlaExceeded };
  }
  return { text: `${minutes}m ${seconds}s ago`, isSlaExceeded };
}

export interface PendingRequestsTriageProps {
  className?: string;
  /** Whether to hide the section if there are 0 pending requests (useful for secondary views) */
  hideIfEmpty?: boolean;
}

export function PendingRequestsTriage({
  className,
  hideIfEmpty = false,
}: PendingRequestsTriageProps) {
  const { data, isLoading, isError } = useAdminRequests({
    status: RequestStatus.PENDING,
    limit: 50,
  });

  const [selectedRequest, setSelectedRequest] =
    useState<EmergencyRequest | null>(null);

  // Pure 1-second live ticker via useSyncExternalStore
  const now = useSyncExternalStore(
    subscribeTicker,
    getTickerSnapshot,
    getServerTickerSnapshot,
  );

  const pendingRequests = data?.requests ?? [];
  const pendingCount = pendingRequests.length;

  if (hideIfEmpty && !isLoading && pendingCount === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/70 border border-border/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              pendingCount > 0
                ? "bg-emergency text-emergency-foreground animate-pulse shadow-sm shadow-emergency/40"
                : "bg-success/15 text-success-ink dark:text-success",
            )}
          >
            {pendingCount > 0 ? (
              <Siren className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Live Emergency Incoming Queue
              </h2>
              {pendingCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emergency" />
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Dhaka metropolitan central triage • High-priority caller dispatch
              board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emergency/10 border border-emergency/30 text-danger-ink dark:text-emergency text-xs sm:text-sm font-bold shadow-xs">
              <span className="tabular-nums">{pendingCount}</span>
              <span>
                {pendingCount === 1 ? "Caller Waiting" : "Callers Waiting"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success/10 border border-success/30 text-success-ink dark:text-success text-xs sm:text-sm font-semibold">
              <Radio className="h-3.5 w-3.5" />
              <span>Triage Clear • Standby</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-card p-5 space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 text-center rounded-2xl border border-danger-ink/30 bg-danger/10">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">
            Failed to connect to emergency queue stream
          </p>
        </div>
      ) : pendingCount === 0 ? (
        /* Clear Reassurance State */
        <Card className="p-8 text-center border-border/60 bg-surface/40">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success-ink dark:text-success mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Dhaka Central Triage Clear
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zero emergency callers currently waiting in queue. All incoming
              trips have been mobilized or resolved. Telemetry monitors remain
              live.
            </p>
          </div>
        </Card>
      ) : (
        /* Incident Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pendingRequests.map((req) => {
            const parsed = parseRequestDescription(req.description);
            const contactPhone = parsed.phone || req.caller?.phone;
            const { text: waitTimeText, isSlaExceeded } = formatElapsedTime(
              req.createdAt,
              now,
            );
            const isCritical = req.priority === Priority.CRITICAL;

            return (
              <div
                key={req.id}
                className={cn(
                  "rounded-2xl border bg-card p-5 shadow-sm space-y-4 transition-all relative overflow-hidden",
                  isCritical
                    ? "border-emergency/60 bg-emergency/2 hover:border-emergency"
                    : "border-border/80 hover:border-border",
                )}
              >
                {/* Critical Top Beacon Ribbon */}
                {isCritical && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emergency animate-pulse" />
                )}

                {/* Card Top: Priority, SLA wait timer, Case ID */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      domain="priority"
                      value={req.priority}
                      size="default"
                    />
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      #{req.id.slice(0, 8)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Wait Time Indicator */}
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border",
                        isSlaExceeded
                          ? "bg-warning/15 text-warning-ink border-warning/30 animate-pulse"
                          : "bg-surface text-muted-foreground border-border",
                      )}
                      title={`Request created at ${new Date(req.createdAt).toLocaleTimeString()}`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Waiting: {waitTimeText}</span>
                    </div>

                    {isSlaExceeded && (
                      <span className="text-xs font-extrabold uppercase tracking-wider text-warning-ink bg-warning/10 px-2.5 py-1 rounded border border-warning/20">
                        SLA Alert
                      </span>
                    )}
                  </div>
                </div>

                {/* Patient / Caller info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2.5">
                    <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
                        Caller
                      </span>
                      <span className="font-semibold text-sm text-foreground">
                        {req.caller?.name || "Anonymous Patient"}
                      </span>
                    </div>
                  </div>

                  {contactPhone ? (
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
                          Callback Phone
                        </span>
                        <a
                          href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                          className="font-mono font-bold text-sm text-primary hover:underline"
                        >
                          {contactPhone}
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Pickup Address */}
                <div className="flex items-start gap-2.5 text-sm bg-surface/50 p-3 rounded-xl border border-border/40">
                  <MapPin className="h-4 w-4 text-emergency shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
                      Pickup Location
                    </span>
                    <span className="font-semibold text-sm text-foreground wrap-break-word">
                      {req.pickupAddress}
                    </span>
                  </div>
                </div>

                {/* Target Hospital & Medical condition */}
                {(parsed.hospital || parsed.notes) && (
                  <div className="space-y-2 text-sm">
                    {parsed.hospital && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="h-4 w-4 text-info-ink dark:text-info shrink-0" />
                        <span>
                          Target Hospital:{" "}
                          <strong className="text-foreground">
                            {parsed.hospital}
                          </strong>
                        </span>
                      </div>
                    )}
                    {parsed.notes && (
                      <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-background/80 p-2.5 rounded-lg border border-border/40">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">
                          <strong className="text-foreground font-semibold">
                            Condition:
                          </strong>{" "}
                          {parsed.notes}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobilization Trigger Button */}
                <div className="pt-2 border-t border-border/60">
                  <Button
                    type="button"
                    variant="emergency"
                    onClick={() => setSelectedRequest(req)}
                    className="w-full gap-2 font-bold text-sm py-2.5 shadow-sm shadow-emergency/20"
                  >
                    <Zap className="h-4 w-4" />
                    <span>⚡ Mobilize Ambulance Unit</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dispatch Mobilization Modal */}
      {selectedRequest && (
        <DispatchModal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
        />
      )}
    </div>
  );
}
