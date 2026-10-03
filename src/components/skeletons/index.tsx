import { Skeleton } from "@/components/shared/Skeleton";
import { Card } from "@/components/shared/Card";

export function DashboardSkeleton({
  statsCount = 4,
  hasChart = true,
}: {
  statsCount?: number;
  hasChart?: boolean;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Title Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: statsCount }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-36" />
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      {hasChart ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <TableSkeleton showHeader={false} />
      )}
    </div>
  );
}

export function TableSkeleton({
  showHeader = true,
  rowCount = 5,
}: {
  showHeader?: boolean;
  rowCount?: number;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {showHeader && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
          <div className="flex gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Table Rows Skeleton */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-sm">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="pt-2 flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </Card>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/80">
          <Skeleton className="h-20 w-20 rounded-full shrink-0" />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
            <Skeleton className="h-5 w-24 rounded-full mx-auto sm:mx-0" />
          </div>
        </div>

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
