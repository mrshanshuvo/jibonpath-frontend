import { Suspense, use } from "react";
import { LiveTrackingCockpit } from "@/features/dispatch";
import { Skeleton } from "@/components/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

function TrackingSkeleton() {
  return (
    <div className="relative w-screen h-dvh bg-surface flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="h-10 w-10 mx-auto rounded-full border-3 border-emergency border-t-transparent animate-spin" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

export default function PatientTrackPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;

  return (
    <Suspense fallback={<TrackingSkeleton />}>
      <LiveTrackingCockpit requestId={requestId} />
    </Suspense>
  );
}
