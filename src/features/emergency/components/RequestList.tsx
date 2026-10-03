"use client";

import Link from "next/link";
import { PlusCircle, AlertCircle, Ambulance } from "lucide-react";
import { Button, EmptyState, Skeleton, Pagination } from "@/components/ui";
import { RequestCard } from "./RequestCard";
import { ROUTES } from "@/config/routes";
import { RequestStatus, type EmergencyRequest } from "@/types/entities.types";
import { useMyRequests } from "../api/emergency.queries";
import { useUrlParams } from "@/hooks/useUrlParams";
import { cn } from "@/lib/utils";

interface RequestListProps {
  onPay?: (request: EmergencyRequest) => void;
}

const STATUS_FILTERS: Array<{ value: RequestStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All Requests" },
  { value: RequestStatus.PENDING, label: "Pending" },
  { value: RequestStatus.DISPATCHED, label: "Dispatched" },
  { value: RequestStatus.COMPLETED, label: "Completed" },
  { value: RequestStatus.CANCELLED, label: "Cancelled" },
];

const VALID_STATUSES: ReadonlySet<string> = new Set<string>([
  RequestStatus.PENDING,
  RequestStatus.DISPATCHED,
  RequestStatus.COMPLETED,
  RequestStatus.CANCELLED,
]);

function isRequestStatus(value: string): value is RequestStatus {
  return VALID_STATUSES.has(value);
}

export function RequestList({ onPay }: RequestListProps) {
  const { params, setParams } = useUrlParams();

  const rawStatus = params.get("status");
  const selectedStatus: RequestStatus | "ALL" =
    rawStatus && isRequestStatus(rawStatus) ? rawStatus : "ALL";

  const parsedPage = Number(params.get("page") ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data, isLoading, isError, refetch } = useMyRequests({
    page,
    limit: 6,
    status: selectedStatus,
  });

  const handleStatusChange = (status: RequestStatus | "ALL") => {
    setParams({
      status: status === "ALL" ? "" : status,
      page: "1",
    });
  };

  const handlePageChange = (newPage: number) => {
    setParams({ page: String(newPage) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div
          role="radiogroup"
          aria-label="Filter requests by status"
          className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0"
        >
          {STATUS_FILTERS.map((filter) => {
            const isSelected = selectedStatus === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleStatusChange(filter.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <Link href={ROUTES.PATIENT.BOOK} className="shrink-0">
          <Button
            variant="emergency"
            size="sm"
            leftIcon={<PlusCircle className="h-4 w-4" aria-hidden="true" />}
          >
            Request Ambulance
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div
          role="status"
          aria-label="Loading requests"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border/80 bg-card p-6 space-y-4"
            >
              <div className="flex justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-8 text-center space-y-3"
        >
          <AlertCircle
            className="h-10 w-10 text-destructive mx-auto"
            aria-hidden="true"
          />
          <h3 className="text-base font-bold text-foreground">
            Failed to Load Requests
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            We couldn&apos;t fetch your emergency requests from the dispatch
            server.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading &&
        !isError &&
        (!data?.requests || data.requests.length === 0) && (
          <EmptyState
            icon={Ambulance}
            title="No Emergency Requests Found"
            description={
              "You don't have any active or past ambulance requests matching this filter."
            }
            action={
              <Link href={ROUTES.PATIENT.BOOK}>
                <Button
                  variant="emergency"
                  size="sm"
                  leftIcon={
                    <PlusCircle className="h-4 w-4" aria-hidden="true" />
                  }
                >
                  Book Emergency Ambulance
                </Button>
              </Link>
            }
          />
        )}

      {!isLoading && !isError && data?.requests && data.requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.requests.map((request) => (
            <RequestCard key={request.id} request={request} onPay={onPay} />
          ))}
        </div>
      )}

      {!isLoading && data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
