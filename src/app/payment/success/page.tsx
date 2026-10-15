"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, Skeleton } from "@/components/shared";
import { ROUTES } from "@/config/routes";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") ||
    searchParams.get("paymentID") ||
    searchParams.get("payment_id");
  const trxId = searchParams.get("trxID") || searchParams.get("tran_id");
  const gateway = (searchParams.get("gateway") || "").toUpperCase();
  const requestId = searchParams.get("requestId");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-6 border-success/40 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-success/15 blur-2xl" />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-tint text-success-ink dark:text-success mx-auto shadow-lg shadow-success/20 border border-success/30 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-success-ink dark:text-success">
              Payment Completed
            </span>
            {gateway && (
              <Badge
                variant="outline"
                className="text-xs font-mono border-success/30 text-success"
              >
                {gateway === "BKASH"
                  ? "bKash Verified"
                  : gateway === "SSLCOMMERZ"
                    ? "SSLCommerz Verified"
                    : gateway}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Emergency Fee Settled
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your emergency ambulance transportation charge has been confirmed
            and settled. An electronic tax receipt has been generated.
          </p>
        </div>

        {(sessionId || trxId || requestId) && (
          <div className="rounded-lg bg-surface p-3 border border-border/50 text-left space-y-2">
            {trxId && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-mono font-bold block">
                  Transaction ID (TRX):
                </span>
                <span className="font-mono text-sm font-semibold text-foreground truncate block">
                  {trxId}
                </span>
              </div>
            )}
            {sessionId && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-mono font-bold block">
                  Payment Reference:
                </span>
                <span className="font-mono text-sm text-foreground truncate block">
                  {sessionId}
                </span>
              </div>
            )}
            {requestId && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-mono font-bold block">
                  Emergency Request ID:
                </span>
                <span className="font-mono text-sm text-foreground truncate block">
                  {requestId}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground font-medium">
          <ShieldCheck className="h-4 w-4 text-success-ink dark:text-success" />
          <span>SSL 256-Bit Encrypted Settlement</span>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href={
              requestId
                ? ROUTES.PATIENT.INVOICE(requestId)
                : ROUTES.PATIENT.PAYMENTS
            }
            className="w-full"
          >
            <Button
              variant="primary"
              className="w-full justify-center"
              leftIcon={<FileText className="h-4 w-4" />}
            >
              {requestId ? "View Invoice Receipt" : "View Invoice Receipts"}
            </Button>
          </Link>

          <Link href={ROUTES.PATIENT.DASHBOARD} className="w-full">
            <Button
              variant="outline"
              className="w-full justify-center"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Return to My Requests
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
