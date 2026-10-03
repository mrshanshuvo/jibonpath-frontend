"use client";

import { useState } from "react";
import { CreditCard, FileText, AlertCircle } from "lucide-react";
import {
  Button,
  Badge,
  Skeleton,
  Pagination,
  EmptyState,
} from "@/components/ui";
import { InvoiceReceipt } from "./InvoiceReceipt";
import { PaymentStatus, type Payment } from "@/types/entities.types";
import { useMyPayments } from "../api/payment.queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function PaymentHistoryTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">(
    "ALL",
  );
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useMyPayments({
    page,
    limit: 8,
    status: statusFilter,
  });

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptOpen(true);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return (
          <Badge variant="success" size="sm">
            SUCCESS
          </Badge>
        );
      case PaymentStatus.PENDING:
        return (
          <Badge variant="warning" size="sm">
            PENDING
          </Badge>
        );
      case PaymentStatus.FAILED:
        return (
          <Badge variant="emergency" size="sm">
            FAILED
          </Badge>
        );
      case PaymentStatus.REFUNDED:
        return (
          <Badge variant="outline" size="sm">
            REFUNDED
          </Badge>
        );
    }
  };

  const getGatewayBadge = (gateway: string) => {
    switch (gateway) {
      case "BKASH":
        return (
          <span className="text-3xs font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
            bKash
          </span>
        );
      case "SSLCOMMERZ":
        return (
          <span className="text-3xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            SSLCommerz
          </span>
        );
      case "STRIPE":
        return (
          <span className="text-3xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Stripe
          </span>
        );
      default:
        return <span className="text-3xs font-medium">{gateway}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          "ALL",
          PaymentStatus.SUCCESS,
          PaymentStatus.PENDING,
          PaymentStatus.FAILED,
        ].map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status as PaymentStatus | "ALL");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === status
                ? "bg-primary text-white font-semibold shadow-xs"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised"
            }`}
          >
            {status === "ALL" ? "All Payments" : status}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center gap-4"
              >
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              Failed to load payment history
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data?.payments || data.payments.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={CreditCard}
              title="No Payment History Found"
              description="You have not made any payments for ambulance trips yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-surface/50 text-3xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Transaction Date</th>
                  <th className="px-5 py-3.5">Request Reference</th>
                  <th className="px-5 py-3.5">Gateway</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {data.payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-3xs text-muted-foreground">
                      {formatDateTime(p.createdAt)}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs">
                      #{p.requestId.slice(0, 8)}
                    </td>

                    <td className="px-5 py-4">{getGatewayBadge(p.gateway)}</td>

                    <td className="px-5 py-4 font-mono font-bold text-sm text-foreground">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="px-5 py-4">{getStatusBadge(p.status)}</td>

                    <td className="px-5 py-4 text-right">
                      {p.status === PaymentStatus.SUCCESS ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(p)}
                          leftIcon={
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          }
                        >
                          Invoice
                        </Button>
                      ) : (
                        <span className="text-3xs text-muted-foreground italic">
                          No receipt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && data?.meta && data.meta.totalPages > 1 && (
          <div className="p-4 border-t border-border/60 flex justify-center">
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceReceipt
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
}
