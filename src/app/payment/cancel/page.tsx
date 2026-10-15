"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, RefreshCw, Info, Loader2 } from "lucide-react";
import { Badge, Button, Card, Skeleton } from "@/components/shared";
import { ROUTES } from "@/config/routes";
import {
  useRequest,
  useMyRequests,
} from "@/features/emergency/api/emergency.queries";
import { PaymentGatewayModal } from "@/features/payment";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const gateway = (searchParams.get("gateway") || "").toUpperCase();
  const status = (searchParams.get("status") || "").toLowerCase();
  const paymentID =
    searchParams.get("paymentID") ||
    searchParams.get("payment_id") ||
    searchParams.get("sessionId");
  const requestIdParam = searchParams.get("requestId");

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch direct request if requestId is in query params
  const { data: directRequest, isLoading: isDirectLoading } = useRequest(
    requestIdParam || undefined,
  );

  // 2. Fallback: fetch user's recent requests to match by paymentID or find latest unpaid request
  const { data: myRequestsData, isLoading: isMyRequestsLoading } =
    useMyRequests({
      limit: 10,
    });

  // Resolve request from param or match by paymentID or take latest active/unpaid request
  const resolvedRequest =
    directRequest ||
    myRequestsData?.requests.find(
      (r) =>
        (requestIdParam && r.id === requestIdParam) ||
        (paymentID && r.payment?.sessionId === paymentID),
    ) ||
    myRequestsData?.requests.find(
      (r) => r.payment?.status !== "SUCCESS" && r.status !== "CANCELLED",
    ) ||
    myRequestsData?.requests[0];

  const isLoadingRequest =
    isDirectLoading || (isMyRequestsLoading && !resolvedRequest);
  const isFailure = status === "failure" || status === "failed";

  const handleRetry = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      <Card className="max-w-3xl w-full p-6 sm:p-8 text-center space-y-6 border border-border bg-card shadow-sm rounded-2xl">
        {/* Solid Icon - No gradients or fuzzy glow blurs */}
        <div
          className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl mx-auto border ${
            isFailure
              ? "bg-destructive/10 text-destructive border-destructive/30"
              : "bg-warning/10 text-warning border-warning/30"
          }`}
        >
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 stroke-[2.2]" />
        </div>

        {/* Heading & Status with clear, readable typography */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                isFailure ? "text-destructive" : "text-warning"
              }`}
            >
              {isFailure ? "Transaction Failed" : "Transaction Interrupted"}
            </span>
            {gateway && (
              <Badge
                variant="outline"
                className="text-xs sm:text-sm font-mono font-bold px-2.5 py-0.5"
              >
                {gateway === "BKASH"
                  ? "bKash"
                  : gateway === "SSLCOMMERZ"
                    ? "SSLCommerz"
                    : gateway}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isFailure ? "Payment Not Completed" : "Payment Cancelled"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {isFailure
              ? "The payment attempt was declined or interrupted. No charges were made to your account."
              : "The checkout session was cancelled or timed out. Your emergency request record is preserved and can be settled anytime."}
          </p>
        </div>

        {/* Reference identifiers with solid background and clear fonts */}
        {(paymentID || resolvedRequest?.id || requestIdParam) && (
          <div className="rounded-xl bg-surface p-4 border border-border text-left space-y-2.5">
            {(resolvedRequest?.id || requestIdParam) && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground uppercase font-mono font-semibold tracking-wide">
                  Emergency Request:
                </span>
                <span className="font-mono font-bold text-foreground">
                  #{(resolvedRequest?.id || requestIdParam)?.slice(0, 8)}
                </span>
              </div>
            )}
            {paymentID && (
              <div className="flex items-center justify-between text-xs sm:text-sm border-t border-border pt-2.5">
                <span className="text-muted-foreground uppercase font-mono font-semibold tracking-wide">
                  Session Reference:
                </span>
                <span className="font-mono text-foreground font-semibold truncate max-w-55 sm:max-w-[320px]">
                  {paymentID}
                </span>
              </div>
            )}
          </div>
        )}

        {/* bKash Sandbox Simulator Credentials - Solid, high-contrast, readable */}
        {gateway === "BKASH" && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5 text-left space-y-3.5">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-sky-400">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span>bKash Sandbox Simulator Credentials</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Personal bKash numbers do not work in Sandbox mode. Use the
              official simulator test credentials below:
            </p>
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="bg-background p-3 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block uppercase font-semibold">
                  Primary Wallet
                </span>
                <span className="text-sm sm:text-base font-bold text-foreground select-all mt-1 block">
                  01770618575
                </span>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block uppercase font-semibold">
                  OTP Code
                </span>
                <span className="text-sm sm:text-base font-bold text-foreground select-all mt-1 block">
                  123456
                </span>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block uppercase font-semibold">
                  PIN
                </span>
                <span className="text-sm sm:text-base font-bold text-foreground select-all mt-1 block">
                  12121
                </span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-border/60 space-y-2">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium block">
                If the primary wallet is locked or has insufficient balance, try
                alternative test numbers:
              </span>
              <div className="flex flex-wrap gap-2.5 font-mono text-xs sm:text-sm">
                <span className="bg-background px-3 py-1.5 rounded-md border border-border font-bold text-sky-300 select-all">
                  01770618576
                </span>
                <span className="bg-background px-3 py-1.5 rounded-md border border-border font-bold text-sky-300 select-all">
                  01619777282
                </span>
                <span className="bg-background px-3 py-1.5 rounded-md border border-border font-bold text-sky-300 select-all">
                  01619777283
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Solid, no glow shadows, comfortable height */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 justify-center font-bold h-12 sm:h-13 text-sm sm:text-base cursor-pointer"
            leftIcon={
              isLoadingRequest ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              )
            }
            onClick={handleRetry}
            disabled={isLoadingRequest}
          >
            {isLoadingRequest ? "Loading Request..." : "Retry Payment Now"}
          </Button>

          <Link href={ROUTES.PATIENT.DASHBOARD} className="flex-1">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center font-medium h-12 sm:h-13 text-sm sm:text-base cursor-pointer"
              leftIcon={<ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Modal opens directly on this page without redirecting to dashboard */}
        {resolvedRequest && (
          <PaymentGatewayModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            request={resolvedRequest}
          />
        )}
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-8 text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-10 w-full mx-auto" />
          </Card>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
