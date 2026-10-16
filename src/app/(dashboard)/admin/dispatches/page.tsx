"use client";

import { useDispatches, MasterCADConsole } from "@/features/dispatch";
import { PendingRequestsTriage, useAdminRequests } from "@/features/emergency";
import { Radio, Siren, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUrlParams } from "@/hooks/useUrlParams";
import { RequestStatus } from "@/types/entities.types";

export default function AdminDispatchesPage() {
  const { params, setParams } = useUrlParams();

  // Tab state: "queue" (default) or "telemetry"
  const activeTab = params.get("tab") === "telemetry" ? "telemetry" : "queue";

  // Pending queue query for badge counter
  const { data: pendingData } = useAdminRequests({
    status: RequestStatus.PENDING,
    limit: 50,
  });
  const pendingCount = pendingData?.requests?.length ?? 0;

  // Active dispatches query for badge counter
  const { data: dispatchesData } = useDispatches({
    limit: 1,
  });
  const activeDispatchesCount =
    dispatchesData?.meta?.total ?? dispatchesData?.dispatches?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Emergency Dispatch & CAD Radar Console
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Central 999-grade CAD triage board for incoming 112/999 calls,
            ambulance allocations, and real-time fleet telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success-tint px-3.5 py-1.5 text-xs font-semibold text-success-ink dark:text-success">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>RADAR TELEMETRY FEED LIVE</span>
        </div>
      </div>

      {/* Primary CAD Console Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        {/* Tab 1: Incoming Triage Queue */}
        <button
          type="button"
          onClick={() => {
            setParams({ tab: "queue" });
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

        {/* Tab 2: Fleet CAD Radar */}
        <button
          type="button"
          onClick={() => {
            setParams({ tab: "telemetry" });
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer",
            activeTab === "telemetry"
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
              : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
          )}
        >
          <Activity className="h-4 w-4 shrink-0" />
          <span>Fleet CAD Radar</span>
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
      {activeTab === "telemetry" && <MasterCADConsole />}
    </div>
  );
}
