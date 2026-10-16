"use client";

import { useDispatches } from "@/features/dispatch";
import { useConfirmCashPayment } from "@/features/payment";
import {
  Skeleton,
  EmptyState,
  Pagination,
  Badge,
  Button,
} from "@/components/shared";
import {
  Ambulance,
  MapPin,
  Building2,
  Clock,
  AlertCircle,
  Banknote,
  CheckCircle,
} from "lucide-react";
import { useUrlParams } from "@/hooks/useUrlParams";
import { formatDateTime } from "@/lib/utils";
import { PaymentStatus } from "@/types/entities.types";

export default function DriverHistoryPage() {
  const { params, setParams } = useUrlParams();
  const parsedPage = Number(params.get("page") ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const confirmCashMutation = useConfirmCashPayment();

  const { data, isLoading, isError } = useDispatches({
    page,
    limit: 6,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Trip &amp; Mission History
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
          {data.dispatches.map((d) => {
            const payment = d.request?.payment;
            const isPaid = payment?.status === PaymentStatus.SUCCESS;
            const fareAmount = payment?.amount || 2080;
            const isCash = Boolean(payment?.gatewayTxnId?.startsWith("CASH"));

            return (
              <div
                key={d.id}
                className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-3.5 hover:border-border transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-foreground">
                      #{d.id.slice(0, 8)}
                    </span>
                    <Badge variant="success" size="sm">
                      {d.status}
                    </Badge>
                    {isPaid ? (
                      <Badge variant="success" size="sm" className="font-mono">
                        ৳ {fareAmount.toLocaleString()} ·{" "}
                        {isCash ? "CASH" : "PAID"}
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" className="font-mono">
                        ৳ {fareAmount.toLocaleString()} · INVOICE PENDING
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDateTime(d.dispatchedAt)}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground pt-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-emergency shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium truncate">
                      {d.request?.pickupAddress || "Dhaka pickup location"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium truncate">
                      {d.hospital?.name || "Dhaka Medical College Hospital"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-3 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                  <span className="font-mono">
                    Unit: {d.ambulance?.vehicleNumber || "AMB-ALS"}
                  </span>
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <span className="text-success font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {isCash
                          ? "Cash Collected at Bay"
                          : "Settled via Stripe"}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-warning font-medium text-[11px]">
                          Invoice Pending
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-bold border-success/40 text-success hover:bg-success/10 cursor-pointer"
                          isLoading={confirmCashMutation.isPending}
                          onClick={() =>
                            confirmCashMutation.mutate({
                              requestId: d.requestId,
                            })
                          }
                          leftIcon={
                            <Banknote className="h-3 w-3 text-success" />
                          }
                        >
                          Collect Cash
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
