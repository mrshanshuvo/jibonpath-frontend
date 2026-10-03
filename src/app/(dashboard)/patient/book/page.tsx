"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmergencyBookingWizard } from "@/features/emergency";
import { Skeleton } from "@/components/ui";
import { HeartPulse } from "lucide-react";
import { InteractiveMap } from "@/components/map/InteractiveMap";

function BookingContent() {
  const searchParams = useSearchParams();
  const initialDestination = searchParams.get("destination") || undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-border/60 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emergency/30 bg-emergency/10 px-3 py-0.5 text-3xs font-bold text-emergency mb-2">
          <HeartPulse className="h-3 w-3" />
          <span>Priority Emergency Dispatch</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Book Emergency Medical Transport
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the triage assessment below to mobilize the nearest matching
          BLS, ACLS, or ICU unit.
        </p>
      </div>

      <EmergencyBookingWizard initialDestination={initialDestination} />

      {/* Interactive Map Section */}
      <section className="pt-4">
        <h2 className="text-sm font-bold text-foreground mb-3">Live Dispatch Area</h2>
        <InteractiveMap
          pickup={{ lng: 90.4125, lat: 23.8103, label: "Pickup" }}
          destination={{ lng: 90.424, lat: 23.82, label: "Hospital" }}
          ambulances={[
            { id: "AMB-01", lng: 90.405, lat: 23.805, label: "AMB-01", type: "ambulance", status: "AVAILABLE" },
            { id: "AMB-02", lng: 90.418, lat: 23.815, label: "AMB-02", type: "ambulance", status: "AVAILABLE" },
          ]}
          hospitals={[
            { id: "H-01", lng: 90.424, lat: 23.82, label: "Dhaka Medical College", type: "hospital", capacity: 45 },
            { id: "H-02", lng: 90.395, lat: 23.795, label: "Square Hospital", type: "hospital", capacity: 30 },
          ]}
        />
      </section>
    </div>
  );
}

export default function BookAmbulancePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
