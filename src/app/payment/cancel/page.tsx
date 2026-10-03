"use client";

import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button, Card, Skeleton } from "@/components/ui";
import { ROUTES } from "@/config/routes";

function PaymentCancelContent() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-6 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="space-y-1.5">
          <span className="text-3xs font-bold uppercase tracking-wider text-amber-400">
            Transaction Interrupted
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payment Not Completed
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The checkout session was cancelled or timed out. Your emergency
            request record is preserved and can be settled anytime.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link href={ROUTES.PATIENT.DASHBOARD} className="w-full">
            <Button
              variant="primary"
              className="w-full justify-center"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Retry from Requests
            </Button>
          </Link>

          <Link href={ROUTES.PATIENT.DASHBOARD} className="w-full">
            <Button
              variant="outline"
              className="w-full justify-center"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Patient Portal
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </Card>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}
