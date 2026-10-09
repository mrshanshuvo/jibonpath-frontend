"use client";

import { useSyncExternalStore } from "react";
import { useDispatches } from "@/features/dispatch";
import { useUrlParams } from "@/hooks/useUrlParams";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared";
import {
  TrendingUp,
  Award,
  DollarSign,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Building2,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const subscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

const RANGE_OPTIONS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
] as const;

const MOCK_DAILY_CHART = [
  { day: "Mon", trips: 2, amount: 3700 },
  { day: "Tue", trips: 3, amount: 5550 },
  { day: "Wed", trips: 1, amount: 1850 },
  { day: "Thu", trips: 4, amount: 7400 },
  { day: "Fri", trips: 3, amount: 5550 },
  { day: "Sat", trips: 5, amount: 9250 },
  { day: "Sun", trips: 2, amount: 3700 },
];

export default function DriverEarningsPage() {
  const isClient = useIsClient();
  const { params, setParam } = useUrlParams();
  const currentRange = params.get("range") || "week";

  const { data, isLoading } = useDispatches({
    page: 1,
    limit: 10,
  });

  const completedDispatches =
    data?.dispatches?.filter((d) => d.status === "COMPLETED") || [];
  const completedCount = completedDispatches.length || 7;
  const baseRatePerTrip = 1850;
  const totalEarned = completedCount * baseRatePerTrip;
  const avgPerTrip = baseRatePerTrip;

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Earnings & Performance
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track completed trip payouts, mission bonuses, and response
            analytics.
          </p>
        </div>

        {/* URL-synced Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-surface-raised">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={currentRange === opt.value ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setParam("range", opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Earnings
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-tint text-success-ink dark:text-success">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-foreground">
              {formatCurrency(totalEarned)}
            </span>
            <p className="text-3xs text-success-ink dark:text-success font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +14% from last period
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Trips
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-foreground">
              {completedCount}
            </span>
            <p className="text-3xs text-muted-foreground mt-1">
              100% successful patient handovers
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Avg Trip Payout
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-tint text-warning-ink dark:text-warning">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-foreground">
              {formatCurrency(avgPerTrip)}
            </span>
            <p className="text-3xs text-muted-foreground mt-1">
              Base fare + emergency allowance
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Driver Rating
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-foreground">
              4.95 ★
            </span>
            <p className="text-3xs text-muted-foreground mt-1">
              Based on 28 hospital evaluations
            </p>
          </div>
        </Card>
      </div>

      {/* Earnings Overview Chart */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle as="h2" className="text-base font-semibold">
            Weekly Payout Trends
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Daily breakdown of paramedic dispatch payouts (BDT)
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 w-full">
            {isClient ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_DAILY_CHART}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--foreground)",
                      fontSize: "0.75rem",
                    }}
                    formatter={(value) => [
                      formatCurrency(Number(value) || 0),
                      "Earnings",
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-surface/30 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  Loading chart...
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Trips Table */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle as="h3" className="text-base font-semibold">
            Recent Trip Settlements
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Detailed log of verified patient transport missions
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface rounded-lg" />
              ))}
            </div>
          ) : !data?.dispatches || data.dispatches.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Calendar}
                title="No Trips Recorded"
                description="Completed trips will appear here with payout status."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-left text-muted-foreground">
                    <th className="pb-3 font-semibold">Mission ID</th>
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Hospital Handover</th>
                    <th className="pb-3 font-semibold">Trip Payout</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.dispatches.slice(0, 5).map((d) => (
                    <tr key={d.id} className="hover:bg-surface-raised/40">
                      <td className="py-3 font-mono font-bold text-primary">
                        #{d.id.slice(0, 8)}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(d.dispatchedAt)}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {d.hospital?.name || "Dhaka Medical College Hospital"}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-foreground">
                        {formatCurrency(baseRatePerTrip)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant={
                            d.status === "COMPLETED" ? "success" : "default"
                          }
                          size="sm"
                        >
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
