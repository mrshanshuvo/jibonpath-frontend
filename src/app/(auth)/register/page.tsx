import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth";
import { Skeleton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register for rapid emergency ambulance booking and patient telemetry tracking.",
};

function RegisterLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="h-8 w-56 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
        <Skeleton className="h-10 rounded-md" />
      </div>
    </div>
  );
}

function RegisterContent() {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create Patient Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Register to quickly request ambulances, track arrivals in real-time, and view medical receipts.
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoadingSkeleton />}>
      <RegisterContent />
    </Suspense>
  );
}
