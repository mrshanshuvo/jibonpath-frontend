"use client";

import { useSyncExternalStore } from "react";
import {
  Users,
  Ambulance,
  Radio,
  CircleDollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Card, Skeleton } from "@/components/ui";
import { useAdminStats } from "../api/admin.queries";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function AdminAnalyticsOverview() {
  const { data: stats, isLoading } = useAdminStats();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-card p-6 space-y-3"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const usersCount = stats?.users.total ?? 0;
  const driversCount = stats?.users.drivers ?? 0;
  const totalFleet = stats?.ambulances.total ?? 0;
  const availableFleet = stats?.ambulances.available ?? 0;
  const dispatchedFleet = stats?.ambulances.dispatched ?? 0;
  const maintenanceFleet = stats?.ambulances.maintenance ?? 0;
  const totalRequests = stats?.requests.total ?? 0;
  const pendingRequests = stats?.requests.pending ?? 0;
  const completedRequests = stats?.requests.completed ?? 0;
  const revenue = stats?.payments.totalRevenue ?? 0;

  const fleetUtilization =
    totalFleet > 0 ? Math.round((dispatchedFleet / totalFleet) * 100) : 0;

  const chartData = [
    { name: "Available", count: availableFleet, color: "var(--color-chart-2)" },
    {
      name: "Dispatched",
      count: dispatchedFleet,
      color: "var(--color-chart-5)",
    },
    {
      name: "Maintenance",
      count: maintenanceFleet,
      color: "var(--color-chart-3)",
    },
    {
      name: "Delivered",
      count: completedRequests,
      color: "var(--color-chart-2)",
    },
    { name: "Pending", count: pendingRequests, color: "var(--color-chart-1)" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue Settled
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success-ink">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              {formatCurrency(revenue)}
            </span>
            <p className="text-3xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-success-ink font-semibold">
                100% Digital
              </span>{" "}
              via bKash / SSL / Stripe
            </p>
          </div>
        </Card>

        {/* Active Dispatches */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Dispatches
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emergency/10 text-emergency">
              <Radio className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-emergency">
              {dispatchedFleet}
            </span>
            <span className="text-sm font-semibold text-muted-foreground uppercase">
              Units
            </span>
          </div>
          <p className="text-3xs text-muted-foreground mt-1">
            {pendingRequests} pending triage calls waiting
          </p>
        </Card>

        {/* Available Fleet */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
              Available Response Fleet
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info-ink">
              <Ambulance className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              {availableFleet} / {totalFleet}
            </span>
            <p className="text-3xs text-muted-foreground mt-1">
              Ready for immediate metropolitan dispatch
            </p>
          </div>
        </Card>

        {/* Total Users */}
        <Card className="p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">
              Registered Accounts
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
              {usersCount}
            </span>
            <p className="text-3xs text-muted-foreground mt-1">
              {driversCount} certified paramedic drivers
            </p>
          </div>
        </Card>
      </div>

      {/* Fleet Utilization & Operations Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Utilization Progress */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Fleet Capacity Utilization
              </h3>
              <p className="text-3xs text-muted-foreground mt-0.5">
                Current allocation across Dhaka emergency sectors
              </p>
            </div>
            <span className="text-sm font-bold text-primary tabular-nums">
              {fleetUtilization}%{" "}
              <span className="font-medium text-muted-foreground text-xs">
                In Transit
              </span>
            </span>
          </div>

          {/* Multi-segment capacity progress bar */}
          <div className="h-3 w-full rounded-full bg-surface overflow-hidden flex">
            <div
              className="bg-emergency h-full transition-all duration-500"
              style={{
                width: `${totalFleet > 0 ? (dispatchedFleet / totalFleet) * 100 : 0}%`,
              }}
              title={`Dispatched: ${dispatchedFleet}`}
            />
            <div
              className="bg-success h-full transition-all duration-500"
              style={{
                width: `${totalFleet > 0 ? (availableFleet / totalFleet) * 100 : 0}%`,
              }}
              title={`Available: ${availableFleet}`}
            />
            <div
              className="bg-warning h-full transition-all duration-500"
              style={{
                width: `${totalFleet > 0 ? (maintenanceFleet / totalFleet) * 100 : 0}%`,
              }}
              title={`Maintenance: ${maintenanceFleet}`}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs pt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emergency" />
              <span className="text-muted-foreground">
                Dispatched ({dispatchedFleet})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span className="text-muted-foreground">
                Available ({availableFleet})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />
              <span className="text-muted-foreground">
                Maintenance ({maintenanceFleet})
              </span>
            </div>
          </div>
        </Card>

        {/* Request Fulfillment Metrics */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Emergency Request Life-Cycle
            </h3>
            <p className="text-3xs text-muted-foreground mt-0.5">
              Cumulative patient triage request resolution
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-surface p-4 text-center border border-border/60">
              <span className="font-mono text-2xl font-bold text-foreground block">
                {totalRequests}
              </span>
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider mt-1 block">
                Total Received
              </span>
            </div>

            <div className="rounded-xl bg-warning/10 p-4 text-center border border-warning-ink/20">
              <span className="font-mono text-2xl font-bold text-warning-ink block">
                {pendingRequests}
              </span>
              <span className="text-3xs font-semibold text-warning-ink uppercase tracking-wider mt-1 block">
                Awaiting Dispatch
              </span>
            </div>

            <div className="rounded-xl bg-success/10 p-4 text-center border border-success-ink/20">
              <span className="font-mono text-2xl font-bold text-success-ink block">
                {completedRequests}
              </span>
              <span className="text-3xs font-semibold text-success-ink uppercase tracking-wider mt-1 block">
                Safely Delivered
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recharts Operational Metrics Distribution */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Fleet & Mission Operations Distribution
              </h3>
              <p className="text-3xs text-muted-foreground">
                Real-time operational distribution across active emergency units
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span>Redis Telemetry Live</span>
          </div>
        </div>

        <div className="h-56 w-full pt-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  className="text-3xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-3xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl">
                          <p className="text-xs font-semibold text-foreground">
                            {data.name}
                          </p>
                          <p className="text-3xs font-mono font-bold text-primary">
                            {data.count} units / cases
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-40 w-full" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
