"use client";

import { useState } from "react";
import {
  useDispatches,
  DispatchStepper,
  LiveTrackingModal,
} from "@/features/dispatch";
import { PendingRequestsTriage } from "@/features/emergency";
import { useAdminRequests } from "@/features/emergency";
import {
  Skeleton,
  EmptyState,
  Pagination,
  StatusBadge,
  Button,
} from "@/components/shared";
import {
  Radio,
  Ambulance,
  MapPin,
  Building2,
  Clock,
  AlertCircle,
  Siren,
  Activity,
} from "lucide-react";
import { formatDateTime, cn } from "@/lib/utils";
import { useUrlParams } from "@/hooks/useUrlParams";
import { DispatchStatus, RequestStatus } from "@/types/entities.types";

export default function AdminDispatchesPage() {
  const { params, setParams } = useUrlParams();
  const [selectedTrackingRequestId, setSelectedTrackingRequestId] =
    useState<string | null>(null);

  // Tab state: "queue" (default) or "telemetry"
  const activeTab = params.get("tab") === "telemetry" ? "telemetry" : "queue";

  // Pending queue query for badge counter
  const { data: pendingData } = useAdminRequests({
    status: RequestStatus.PENDING,
    limit: 50,
  });
  const pendingCount = pendingData?.requests?.length ?? 0;

  // Active dispatches query
  const rawStatus = params.get("status");
  const statusFilter: DispatchStatus | "ALL" =
    rawStatus &&
    Object.values(DispatchStatus).includes(rawStatus as DispatchStatus)
      ? (rawStatus as DispatchStatus)
      : "ALL";

  const parsedPage = Number(params.get("page") ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data, isLoading, isError } = useDispatches({
    page,
    limit: 6,
    status: statusFilter,
  });

  const activeDispatchesCount =
    data?.meta?.total ?? data?.dispatches?.length ?? 0;

  const statuses: Array<DispatchStatus | "ALL"> = [
    "ALL",
    DispatchStatus.DISPATCHED,
    DispatchStatus.EN_ROUTE,
    DispatchStatus.PATIENT_PICKUP,
    DispatchStatus.HOSPITAL_SELECTED,
    DispatchStatus.HOSPITAL_ARRIVAL,
    DispatchStatus.COMPLETED,
  ];

  const statusLabels: Record<DispatchStatus, string> = {
    [DispatchStatus.DISPATCHED]: "Dispatched",
    [DispatchStatus.EN_ROUTE]: "En Route",
    [DispatchStatus.PATIENT_PICKUP]: "Patient Pickup",
    [DispatchStatus.HOSPITAL_SELECTED]: "Hospital Selected",
    [DispatchStatus.HOSPITAL_ARRIVAL]: "Hospital Arrival",
    [DispatchStatus.COMPLETED]: "Completed",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Emergency Dispatch & Command Console
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Central CAD triage board for incoming callers, vehicle allocations,
            and live fleet telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success-tint px-3.5 py-1.5 text-xs font-semibold text-success-ink dark:text-success">
          <Radio className="h-3.5 w-3.5" />
          <span>RADAR TELEMETRY POLLING ACTIVE</span>
        </div>
      </div>

      {/* Primary CAD Console Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        {/* Tab 1: Incoming Triage Queue */}
        <button
          type="button"
          onClick={() => {
            setParams({ tab: "queue", page: "1" });
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative",
            activeTab === "queue"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
          )}
        >
          <Siren className="h-4 w-4 shrink-0" />
          <span>Incoming Triage Queue</span>
          {pendingCount > 0 ? (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold",
                activeTab === "queue"
                  ? "bg-emergency text-emergency-foreground animate-pulse"
                  : "bg-emergency/20 text-danger-ink dark:text-emergency",
              )}
            >
              {pendingCount}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-raised text-muted-foreground">
              0
            </span>
          )}
        </button>

        {/* Tab 2: Active Fleet Telemetry */}
        <button
          type="button"
          onClick={() => {
            setParams({ tab: "telemetry", page: "1" });
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
            activeTab === "telemetry"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
          )}
        >
          <Activity className="h-4 w-4 shrink-0" />
          <span>Active Fleet Telemetry</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              activeTab === "telemetry"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-surface-raised text-muted-foreground",
            )}
          >
            {activeDispatchesCount}
          </span>
        </button>
      </div>

      {/* TAB 1: Incoming Triage Queue */}
      {activeTab === "queue" && (
        <div className="space-y-6">
          <PendingRequestsTriage />
        </div>
      )}

      {/* TAB 2: Active Fleet Telemetry */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          {/* Stage Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setParams({
                    status: status === "ALL" ? "" : status,
                    page: "1",
                    tab: "telemetry",
                  });
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                )}
              >
                {status === "ALL" ? "All Dispatches" : statusLabels[status]}
              </button>
            ))}
          </div>

          {/* Dispatch Cards */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/80 bg-card p-6 space-y-4"
                >
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center rounded-2xl border border-danger-ink/30 bg-danger/10">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">
                Failed to connect to dispatch stream
              </p>
            </div>
          ) : !data?.dispatches || data.dispatches.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Radio}
                title="No Active Dispatches"
                description="There are currently no active ambulance units matching the chosen telemetry stage."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {data.dispatches.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4 hover:border-border transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emergency text-emergency-foreground">
                        <Ambulance className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            Mission #{d.id.slice(0, 8)}
                          </span>
                          <StatusBadge
                            domain="dispatch"
                            value={d.status}
                            size="sm"
                            pulse={
                              d.status === DispatchStatus.DISPATCHED ||
                              d.status === DispatchStatus.EN_ROUTE
                            }
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          Unit: {d.ambulance?.vehicleNumber || "DHAKA-EM-102"} •
                          Driver: {d.driver?.user?.name || "Paramedic"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Dispatched: {formatDateTime(d.dispatchedAt)}</span>
                    </div>
                  </div>

                  {/* Live Stepper View */}
                  <DispatchStepper currentStatus={d.status} />

                  {/* Route details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-surface/40 p-3 rounded-xl border border-border/40">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-emergency shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block font-bold">
                          Pickup Address
                        </span>
                        <span className="font-semibold text-foreground">
                          {d.request?.pickupAddress ||
                            "Pickup location not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block font-bold">
                          Receiving Trauma Bay
                        </span>
                        <span className="font-semibold text-foreground">
                          {d.hospital?.name || "Dhaka Medical College Hospital"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      Dispatch ID: #{d.id.slice(0, 8)}
                    </span>
                    <Button
                      variant="emergency"
                      size="sm"
                      onClick={() => setSelectedTrackingRequestId(d.requestId)}
                      leftIcon={<Radio className="h-3.5 w-3.5" />}
                    >
                      Track Live Radar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && data?.meta && data.meta.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={(p) =>
                  setParams({ page: String(p), tab: "telemetry" })
                }
              />
            </div>
          )}
        </div>
      )}

      <LiveTrackingModal
        isOpen={Boolean(selectedTrackingRequestId)}
        onClose={() => setSelectedTrackingRequestId(null)}
        requestId={selectedTrackingRequestId}
      />
    </div>
  );
}
