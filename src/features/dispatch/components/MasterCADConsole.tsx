"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Radio,
  Search,
  Ambulance,
  MapPin,
  Building2,
  Gauge,
  Siren,
} from "lucide-react";
import { Button, Badge, StatusBadge, EmptyState } from "@/components/shared";
import { MasterCADRadarMap } from "./MasterCADRadarMap";
import { LiveTrackingModal } from "./LiveTrackingModal";
import { DispatchStepper } from "./DispatchStepper";
import { useDispatches } from "../api/dispatch.queries";
import { useAuthStore } from "@/stores/auth.store";
import {
  DispatchStatus,
  Priority,
  type Dispatch,
  type TelemetryTick,
} from "@/types/entities.types";
import { formatDateTime, cn } from "@/lib/utils";

type ViewMode = "split" | "map" | "grid";

export function MasterCADConsole() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: dispatchesData, refetch } = useDispatches({
    limit: 100, // Fetch all current dispatches for the fleet radar
  });

  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(
    null,
  );
  const [modalRequestId, setModalRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DispatchStatus>(
    "ALL",
  );
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [telemetryFeed, setTelemetryFeed] = useState<
    Map<string, TelemetryTick>
  >(new Map());
  const [streamConnected, setStreamConnected] = useState(false);

  // Subscribe to Master Fleet Telemetry SSE Stream
  useEffect(() => {
    if (!accessToken) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const sseUrl = `${apiUrl}/dispatches/telemetry/feed?token=${encodeURIComponent(
      accessToken,
    )}`;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setStreamConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "connected" && Array.isArray(payload.ticks)) {
            setTelemetryFeed((prev) => {
              const updated = new Map(prev);
              for (const tick of payload.ticks) {
                if (tick?.dispatchId) updated.set(tick.dispatchId, tick);
              }
              return updated;
            });
          } else if (payload.type === "telemetry" && payload.dispatchId) {
            if (payload.stage === "COMPLETED") {
              setTelemetryFeed((prev) => {
                const updated = new Map(prev);
                updated.delete(payload.dispatchId);
                return updated;
              });
              refetch();
            } else {
              setTelemetryFeed((prev) => {
                const updated = new Map(prev);
                updated.set(payload.dispatchId, {
                  dispatchId: payload.dispatchId,
                  lat: payload.lat,
                  lng: payload.lng,
                  heading: payload.heading,
                  speedKmh: payload.speedKmh,
                  stage: payload.stage,
                  updatedAt: payload.updatedAt || new Date().toISOString(),
                });
                return updated;
              });
            }
          }
        } catch {
          // Ignore JSON parse heartbeats
        }
      };

      eventSource.onerror = () => {
        setStreamConnected(false);
      };
    } catch {
      queueMicrotask(() => setStreamConnected(false));
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [accessToken, refetch]);

  // Filter only active / open dispatches for the radar
  const activeDispatches = useMemo(() => {
    const list: Dispatch[] = dispatchesData?.dispatches ?? [];
    return list.filter((d) => d.status !== DispatchStatus.COMPLETED);
  }, [dispatchesData]);

  // Compute live tactical overview metrics
  const metrics = useMemo(() => {
    const totalActive = activeDispatches.length;
    let code3Transits = 0;
    let atTraumaBay = 0;
    let totalSpeed = 0;
    let movingCount = 0;

    for (const d of activeDispatches) {
      const tick = telemetryFeed.get(d.id) || d.latestTelemetry;
      const speed = tick?.speedKmh ?? 0;
      if (speed > 5) {
        totalSpeed += speed;
        movingCount += 1;
      }
      if (
        d.status === DispatchStatus.HOSPITAL_SELECTED ||
        d.status === DispatchStatus.PATIENT_PICKUP
      ) {
        code3Transits += 1;
      }
      if (d.status === DispatchStatus.HOSPITAL_ARRIVAL) {
        atTraumaBay += 1;
      }
    }

    const avgSpeed = movingCount > 0 ? Math.round(totalSpeed / movingCount) : 0;

    return { totalActive, code3Transits, atTraumaBay, avgSpeed };
  }, [activeDispatches, telemetryFeed]);

  // Filtered dispatches for the operations deck
  const filteredDispatches = useMemo(() => {
    return activeDispatches.filter((d) => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && d.status !== statusFilter) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const vehicle = d.ambulance?.vehicleNumber?.toLowerCase() || "";
        const driver = d.driver?.user?.name?.toLowerCase() || "";
        const pickup = d.request?.pickupAddress?.toLowerCase() || "";
        const hospital = d.hospital?.name?.toLowerCase() || "";
        return (
          vehicle.includes(q) ||
          driver.includes(q) ||
          pickup.includes(q) ||
          hospital.includes(q)
        );
      }

      return true;
    });
  }, [activeDispatches, statusFilter, searchQuery]);

  const selectedDispatch = useMemo(() => {
    return activeDispatches.find((d) => d.id === selectedDispatchId) || null;
  }, [activeDispatches, selectedDispatchId]);

  return (
    <div className="space-y-4">
      {/* CAD Master Tactical Header & Real-Time Fleet Telemetry HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Missions
            </span>
            <Ambulance className="h-4 w-4 text-emergency" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-foreground">
              {metrics.totalActive}
            </span>
            <span className="text-xs text-muted-foreground">in rotation</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Code-3 Transits
            </span>
            <Siren className="h-4 w-4 text-emergency animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-emergency">
              {metrics.code3Transits}
            </span>
            <span className="text-xs text-muted-foreground">critical runs</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Trauma Bay Dock
            </span>
            <Building2 className="h-4 w-4 text-success" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-success">
              {metrics.atTraumaBay}
            </span>
            <span className="text-xs text-muted-foreground">handovers</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Fleet Velocity
            </span>
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-black text-foreground">
              {metrics.avgSpeed}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              km/h avg
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface/60 p-3 rounded-2xl border border-border/70 backdrop-blur-md">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search unit plate, driver, scene address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emergency/40 transition-all"
          />
        </div>

        {/* Right: Stream Indicator & View Switcher */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-semibold">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                streamConnected
                  ? "bg-success animate-ping"
                  : "bg-warning animate-pulse",
              )}
            />
            <span className="text-foreground">
              {streamConnected ? "RADAR LIVE" : "CONNECTING..."}
            </span>
          </div>

          <div className="flex items-center rounded-xl border border-border p-0.5 bg-card">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "split"
                  ? "bg-emergency text-emergency-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Split CAD
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "map"
                  ? "bg-emergency text-emergency-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Full Radar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-emergency text-emergency-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={cn(
            "px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer",
            statusFilter === "ALL"
              ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          ALL UNITS ({activeDispatches.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(DispatchStatus.DISPATCHED)}
          className={cn(
            "px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer",
            statusFilter === DispatchStatus.DISPATCHED
              ? "bg-warning text-warning-foreground border-warning font-bold shadow-xs"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          EN ROUTE PICKUP
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(DispatchStatus.PATIENT_PICKUP)}
          className={cn(
            "px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer",
            statusFilter === DispatchStatus.PATIENT_PICKUP
              ? "bg-warning text-warning-foreground border-warning font-bold shadow-xs"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          ON SCENE
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(DispatchStatus.HOSPITAL_SELECTED)}
          className={cn(
            "px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer",
            statusFilter === DispatchStatus.HOSPITAL_SELECTED
              ? "bg-emergency text-emergency-foreground border-emergency font-bold shadow-xs"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          TRANSPORTING (CODE 3)
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(DispatchStatus.HOSPITAL_ARRIVAL)}
          className={cn(
            "px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer",
            statusFilter === DispatchStatus.HOSPITAL_ARRIVAL
              ? "bg-success text-success-foreground border-success font-bold shadow-xs"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          HOSPITAL BAY
        </button>
      </div>

      {/* Main Dynamic Workspace by View Mode */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Tactical Mission Deck */}
          <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredDispatches.length === 0 ? (
              <EmptyState
                icon={Ambulance}
                title="No Active Missions Found"
                description={
                  searchQuery
                    ? "No dispatches match your search query."
                    : "There are currently no active ambulance runs in this filter."
                }
              />
            ) : (
              filteredDispatches.map((d) => {
                const tick = telemetryFeed.get(d.id) || d.latestTelemetry;
                const isSelected = selectedDispatchId === d.id;
                const speed = tick?.speedKmh ?? 0;

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDispatchId(d.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer relative",
                      isSelected
                        ? "bg-card border-emergency ring-2 ring-emergency/30 shadow-xl"
                        : "bg-card border-border/80 hover:border-emergency/50 hover:bg-surface-raised/40",
                    )}
                  >
                    {/* Top Row: Vehicle plate & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl font-bold shadow-sm",
                            isSelected
                              ? "bg-emergency text-emergency-foreground"
                              : "bg-surface border border-border text-foreground",
                          )}
                        >
                          <Ambulance className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-foreground block">
                            {d.ambulance?.vehicleNumber || "AMB-ALS"}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {d.driver?.user?.name || "Paramedic On Duty"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge
                          domain="dispatch"
                          value={d.status}
                          size="sm"
                          pulse={
                            d.status === DispatchStatus.DISPATCHED ||
                            d.status === DispatchStatus.HOSPITAL_SELECTED
                          }
                        />
                        {d.request?.priority && (
                          <Badge
                            variant={
                              d.request.priority === Priority.CRITICAL
                                ? "emergency"
                                : "warning"
                            }
                            size="sm"
                          >
                            {d.request.priority}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Mid: Route Points */}
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-emergency shrink-0 mt-0.5" />
                        <span className="text-foreground font-medium truncate">
                          {d.request?.pickupAddress || "Scene location"}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        <span className="text-foreground font-medium truncate">
                          {d.hospital?.name || "Dhaka Medical College Hospital"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Telemetry stats & CTA */}
                    <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-bold",
                            speed > 0
                              ? "text-emergency"
                              : "text-muted-foreground",
                          )}
                        >
                          {speed} km/h
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {formatDateTime(d.dispatchedAt).split(",")[1] ||
                            "Dispatched"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDispatchId(d.id);
                          }}
                        >
                          Focus
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalRequestId(d.requestId);
                          }}
                        >
                          Radar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Master Mapbox Tactical Canvas */}
          <div className="lg:col-span-7 sticky top-4">
            <MasterCADRadarMap
              dispatches={activeDispatches}
              telemetryFeed={telemetryFeed}
              selectedDispatchId={selectedDispatchId}
              onSelectDispatch={(id) => setSelectedDispatchId(id)}
              className="h-[720px]"
            />
          </div>
        </div>
      )}

      {viewMode === "map" && (
        <div className="relative">
          <MasterCADRadarMap
            dispatches={activeDispatches}
            telemetryFeed={telemetryFeed}
            selectedDispatchId={selectedDispatchId}
            onSelectDispatch={(id) => setSelectedDispatchId(id)}
            className="h-[780px]"
          />

          {/* Floating HUD Inspector if a vehicle is selected */}
          {selectedDispatch && (
            <div className="absolute bottom-6 left-6 z-30 max-w-sm w-full bg-card/95 backdrop-blur-2xl border border-border/90 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emergency text-emergency-foreground flex items-center justify-center font-bold">
                    <Ambulance className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      {selectedDispatch.ambulance?.vehicleNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {selectedDispatch.driver?.user?.name}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDispatchId(null)}
                  className="text-muted-foreground hover:text-foreground text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emergency shrink-0 mt-0.5" />
                  <span className="text-foreground truncate">
                    {selectedDispatch.request?.pickupAddress}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span className="text-foreground truncate">
                    {selectedDispatch.hospital?.name || "DMCH Trauma Bay"}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                <StatusBadge
                  domain="dispatch"
                  value={selectedDispatch.status}
                  size="sm"
                />
                <Button
                  variant="emergency"
                  size="sm"
                  className="h-7 text-xs font-bold"
                  onClick={() => setModalRequestId(selectedDispatch.requestId)}
                >
                  Full Modal
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDispatches.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emergency text-emergency-foreground font-bold shadow-md">
                    <Ambulance className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-foreground block">
                      {d.ambulance?.vehicleNumber || "AMB"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {d.driver?.user?.name || "Paramedic"}
                    </span>
                  </div>
                </div>

                <StatusBadge domain="dispatch" value={d.status} size="sm" />
              </div>

              <DispatchStepper currentStatus={d.status} />

              <div className="p-3 rounded-xl bg-surface/50 border border-border/40 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emergency shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium line-clamp-1">
                    {d.request?.pickupAddress || "Scene location"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium line-clamp-1">
                    {d.hospital?.name || "Dhaka Medical College Hospital"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-xs font-mono text-muted-foreground">
                  ID: #{d.id.slice(0, 8)}
                </span>
                <Button
                  variant="emergency"
                  size="sm"
                  onClick={() => setModalRequestId(d.requestId)}
                  leftIcon={<Radio className="h-3.5 w-3.5" />}
                >
                  Track Radar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Modal Triage View */}
      <LiveTrackingModal
        isOpen={Boolean(modalRequestId)}
        onClose={() => setModalRequestId(null)}
        requestId={modalRequestId}
      />
    </div>
  );
}
