"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/routes";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime crashes in development
    if (process.env.NODE_ENV === "development") {
      console.error("[Root Error Boundary Caught]:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 mb-6 shadow-lg shadow-rose-500/20">
        <AlertOctagon className="h-8 w-8" />
      </div>

      <p className="text-xs uppercase tracking-widest font-semibold text-rose-500 mb-2">
        System Interruption Encountered
      </p>
      <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
        Something Went Wrong
      </h1>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        Our medical telemetry platform encountered an unexpected issue while loading
        this view. Operational data remains intact.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => reset()}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Try Again
        </Button>
        <Link href={ROUTES.home}>
          <Button variant="secondary" size="md" leftIcon={<Home className="h-4 w-4" />}>
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
