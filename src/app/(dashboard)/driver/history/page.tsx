"use client";

import { useState } from "react";
import { useDispatches } from "@/features/dispatch";
import { Skeleton, EmptyState, Pagination, Badge } from "@/components/shared";
import { Ambulance, MapPin, Building2, Clock, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function DriverHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useDispatches({
    page,
    limit: 6,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Trip & Mission History
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review completed patient transport assignments, emergency checkpoints,
          and handover timestamps.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-card p-6 space-y-3"
            >
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border border-danger/30 bg-danger-tint">
          <AlertCircle className="h-10 w-10 text-danger-ink dark:text-danger mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">
            Failed to load trip history
          </p>
        </div>
      ) : !data?.dispatches || data.dispatches.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Ambulance}
            title="No Past Trips Recorded"
            description="You have not completed any emergency ambulance trips yet."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.dispatches.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">
                    #{d.id.slice(0, 8)}
                  </span>
                  <Badge variant="success" size="sm">
                    {d.status}
                  </Badge>
                </div>
                <span className="text-3xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(d.dispatchedAt)}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emergency shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium truncate">
                    {d.request?.pickupAddress || "Dhaka pickup location"}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium truncate">
                    {d.hospital?.name || "Dhaka Medical College Hospital"}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3 flex items-center justify-between text-3xs text-muted-foreground">
                <span>
                  Unit: {d.ambulance?.vehicleNumber || "DHAKA-EM-101"}
                </span>
                <span>Checkpoints: {d.tripStatusLogs?.length || 0} logged</span>
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
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
