"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, AlertCircle, Ambulance } from "lucide-react";
import { Button, EmptyState, Skeleton, Pagination } from "@/components/ui";
import { RequestCard } from "./RequestCard";
import { ROUTES } from "@/config/routes";
import { RequestStatus, type EmergencyRequest } from "@/types/entities.types";
import { useMyRequests } from "../api/emergency.queries";

interface RequestListProps {
  onPay?: (request: EmergencyRequest) => void;
}

export function RequestList({ onPay }: RequestListProps) {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "ALL">("ALL");

  const { data, isLoading, isError, refetch } = useMyRequests({
    page,
    limit: 6,
    status: selectedStatus,
  });

  const statuses: Array<RequestStatus | "ALL"> = [
    "ALL",
    RequestStatus.PENDING,
    RequestStatus.DISPATCHED,
    RequestStatus.COMPLETED,
    RequestStatus.CANCELLED,
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls: Status Filters & Book Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === status
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised"
              }`}
            >
              {status === "ALL" ? "All Requests" : status}
            </button>
          ))}
        </div>

        <Link href={ROUTES.PATIENT.BOOK}>
          <Button variant="emergency" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
            Request Ambulance
          </Button>
        </Link>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            Failed to Load Requests
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            We could not fetch your emergency requests from the dispatch server.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!data?.requests || data.requests.length === 0) && (
        <EmptyState
          icon={Ambulance}
          title="No Emergency Requests Found"
          description="You do not have any active or past ambulance requests matching this filter."
          actionLabel="Book Emergency Ambulance"
          onAction={() => window.location.assign(ROUTES.PATIENT.BOOK)}
        />
      )}

      {/* Request Grid */}
      {!isLoading && !isError && data?.requests && data.requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.requests.map((request) => (
            <RequestCard key={request.id} request={request} onPay={onPay} />
          ))}
        </div>
      )}

      {/* Pagination */}
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
