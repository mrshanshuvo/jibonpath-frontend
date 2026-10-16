import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth";
import { Skeleton } from "@/components/ui";
import { JibonPathIcon } from "@/components/brand";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Register for rapid emergency ambulance booking and patient telemetry tracking.",
};

function RegisterLoadingSkeleton() {
  return (
    <div className="space-y-7 p-6 sm:p-8 md:p-10">
      <div className="space-y-2 text-center">
        <Skeleton className="h-12 w-12 rounded-2xl mx-auto" />
        <Skeleton className="h-8 w-56 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <div className="space-y-4 pt-4">
        <Skeleton className="h-11 rounded-md" />
        <Skeleton className="h-11 rounded-md" />
        <Skeleton className="h-11 rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-11 rounded-md" />
          <Skeleton className="h-11 rounded-md" />
        </div>
        <Skeleton className="h-11 rounded-md" />
      </div>
    </div>
  );
}

function RegisterContent() {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/85 p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl space-y-7">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-card border border-border/80 shadow-md mx-auto mb-1 group hover:border-primary/40 transition-colors">
          <JibonPathIcon size={38} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Create Patient Account
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Register to quickly request ambulances, track arrivals in real-time,
          and access Jibon<span className="text-primary font-bold">Path</span>{" "}
          emergency services.
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
