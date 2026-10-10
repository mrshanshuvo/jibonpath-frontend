import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm, DemoLoginGrid } from "@/features/auth";
import { Skeleton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Access the JibonPath Emergency Ambulance Dispatch and telemetry command portal.",
};

function LoginLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
      </div>
    </div>
  );
}

function LoginContent() {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome to JibonPath
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to dispatch, monitor, or request emergency medical transport.
        </p>
      </div>

      {/* 1-Click Demo Login Grid for evaluators */}
      <DemoLoginGrid />

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border/60" />
        <span className="absolute bg-card px-3 text-3xs font-medium uppercase tracking-wider text-muted-foreground">
          Or sign in manually
        </span>
      </div>

      {/* Standard Email/Password Form */}
      <LoginForm />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
