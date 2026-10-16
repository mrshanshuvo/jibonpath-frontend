"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RequestList } from "@/features/emergency";
import { PaymentGatewayModal } from "@/features/payment";
import { LiveTrackingModal } from "@/features/dispatch";
import type { EmergencyRequest } from "@/types/entities.types";

export function PatientDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeRequestId = searchParams.get("active");

  const [paymentRequest, setPaymentRequest] = useState<EmergencyRequest | null>(
    null,
  );

  const handleCloseTracking = () => {
    // Clear active query parameter cleanly
    const params = new URLSearchParams(searchParams.toString());
    params.delete("active");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Emergency Ambulance Requests
            </h1>
            <span aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track active ambulance dispatches, monitor arrival telemetry, and
            manage past medical transit history.
          </p>
        </div>
      </header>

      <RequestList onPay={setPaymentRequest} />

      <LiveTrackingModal
        isOpen={Boolean(activeRequestId)}
        onClose={handleCloseTracking}
        requestId={activeRequestId}
      />

      <PaymentGatewayModal
        isOpen={Boolean(paymentRequest)}
        onClose={() => setPaymentRequest(null)}
        request={paymentRequest}
      />
    </div>
  );
}
