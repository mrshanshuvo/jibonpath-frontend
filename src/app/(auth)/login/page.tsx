import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm, DemoLoginGrid } from "@/features/auth";
import { Skeleton } from "@/components/ui";
import { JibonPathIcon } from "@/components/brand";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Access the JibonPath Emergency Ambulance Dispatch and telemetry command portal.",
};

function LoginLoadingSkeleton() {
  return (
    <div className="space-y-7 p-6 sm:p-8 md:p-10">
      <div className="space-y-2 text-center">
        <Skeleton className="h-12 w-12 rounded-2xl mx-auto" />
        <Skeleton className="h-8 w-56 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-11 rounded-md" />
        <Skeleton className="h-11 rounded-md" />
        <Skeleton className="h-11 rounded-md" />
      </div>
    </div>
  );
}

function LoginContent() {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/85 p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl space-y-7">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-card border border-border/80 shadow-md mx-auto mb-1 group hover:border-primary/40 transition-colors">
          <JibonPathIcon size={38} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Welcome to Jibon<span className="text-primary font-black">Path</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Sign in to dispatch, monitor, or request emergency medical transport.
        </p>
      </div>

      {/* 1-Click Demo Login Grid for evaluators */}
      <DemoLoginGrid />

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border/60" />
        <span className="absolute bg-card px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
