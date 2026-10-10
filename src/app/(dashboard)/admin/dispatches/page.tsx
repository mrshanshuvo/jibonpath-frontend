"use client";

import { useDispatches } from "@/features/dispatch";
import { DispatchStepper } from "@/features/dispatch";
import {
  Skeleton,
  EmptyState,
  Pagination,
  StatusBadge,
} from "@/components/shared";
import {
  Radio,
  Ambulance,
  MapPin,
  Building2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useUrlParams } from "@/hooks/useUrlParams";
import { DispatchStatus } from "@/types/entities.types";

export default function AdminDispatchesPage() {
  const { params, setParams } = useUrlParams();

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

  const statuses: Array<DispatchStatus | "ALL"> = [
    "ALL",
    DispatchStatus.DISPATCHED,
    DispatchStatus.EN_ROUTE,
    DispatchStatus.PATIENT_PICKUP,
    DispatchStatus.HOSPITAL_SELECTED,
    DispatchStatus.HOSPITAL_ARRIVAL,
    DispatchStatus.COMPLETED,
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Metropolitan Active Dispatches
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time live telemetry tracking and stage monitoring for all
            ambulance units in transit.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-3xs font-semibold text-emerald-900 dark:text-emerald-300">
          <Radio className="h-3 w-3" />
          <span>RADAR TELEMETRY POLLING ACTIVE</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => {
              setParams({
                status: status === "ALL" ? "" : status,
                page: "1",
              });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === status
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised"
            }`}
          >
            {status === "ALL" ? "All Dispatches" : status}
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
                    <span className="text-3xs text-muted-foreground font-mono">
                      Unit: {d.ambulance?.vehicleNumber || "DHAKA-EM-102"} •
                      Driver: {d.driver?.user?.name || "Paramedic"}
                    </span>
                  </div>
                </div>

                <div className="text-3xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
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
                    <span className="text-3xs text-muted-foreground uppercase tracking-wider block">
                      Pickup Address
                    </span>
                    <span className="font-medium text-foreground">
                      {d.request?.pickupAddress ||
                        "Pickup location not provided"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-3xs text-muted-foreground uppercase tracking-wider block">
                      Receiving Trauma Bay
                    </span>
                    <span className="font-medium text-foreground">
                      {d.hospital?.name || "Dhaka Medical College Hospital"}
                    </span>
                  </div>
                </div>
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
            onPageChange={(p) => setParams({ page: String(p) })}
          />
        </div>
      )}
    </div>
  );
}
