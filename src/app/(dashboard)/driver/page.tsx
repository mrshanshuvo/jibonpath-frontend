"use client";

import { useActiveDriverDispatch, DriverActiveDispatch } from "@/features/dispatch";
import { Skeleton, EmptyState, Button } from "@/components/ui";
import { Ambulance, Radio, RefreshCw, AlertCircle } from "lucide-react";

export default function DriverDashboardPage() {
  const { data: dispatch, isLoading, isError, refetch } = useActiveDriverDispatch();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center space-y-3">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-foreground">
          Telemetry Connection Interrupted
        </h3>
        <p className="text-xs text-muted-foreground">
          Could not establish live link with Dhaka Central Dispatch.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
          Reconnect
        </Button>
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="space-y-6">
        <div className="border-b border-border/60 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Paramedic Driver Cockpit
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time telemetry and navigation console for active emergency assignments.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-3xs font-medium text-emerald-400">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>STANDBY READY ON ROTATION</span>
          </div>
        </div>

        <div className="py-12">
          <EmptyState
            icon={Ambulance}
            title="No Active Emergency Dispatch"
            description="You are currently in standby rotation. When an emergency call is assigned to your vehicle, turn-by-turn routing and patient triage details will appear here automatically."
            actionLabel="Check Dispatch Link"
            onAction={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return <DriverActiveDispatch dispatch={dispatch} />;
}
