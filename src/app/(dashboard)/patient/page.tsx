import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { PatientDashboard } from "@/features/patient";

function RequestListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="mt-3 h-3 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function PatientDashboardPage() {
  return (
    <Suspense fallback={<RequestListSkeleton />}>
      <PatientDashboard />
    </Suspense>
  );
}
