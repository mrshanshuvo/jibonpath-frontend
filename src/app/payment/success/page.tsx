"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Button, Card, Skeleton } from "@/components/ui";
import { ROUTES } from "@/config/routes";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") || searchParams.get("paymentID");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-6 border-emerald-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-success mx-auto shadow-lg shadow-emerald-500/20 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-1.5">
          <span className="text-3xs font-bold uppercase tracking-wider text-success">
            Payment Completed
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Emergency Fee Settled
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your emergency ambulance transportation charge has been confirmed
            and settled. An electronic tax receipt has been generated.
          </p>
        </div>

        {sessionId && (
          <div className="rounded-lg bg-surface p-3 border border-border/50 text-left">
            <span className="text-3xs text-muted-foreground uppercase font-mono block">
              Payment Reference:
            </span>
            <span className="font-mono text-xs text-foreground truncate block">
              {sessionId}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 justify-center text-3xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          <span>SSL 256-Bit Encrypted Settlement</span>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link href={ROUTES.PATIENT.PAYMENTS} className="w-full">
            <Button
              variant="primary"
              className="w-full justify-center"
              leftIcon={<FileText className="h-4 w-4" />}
            >
              View Invoice Receipts
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
