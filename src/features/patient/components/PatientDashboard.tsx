"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RequestList } from "@/features/emergency";
import { PaymentGatewayModal } from "@/features/payment";
import type { EmergencyRequest } from "@/types/entities.types";
import { ROUTES } from "@/config/routes";

export function PatientDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeRequestId = searchParams.get("active");

  const [paymentRequest, setPaymentRequest] = useState<EmergencyRequest | null>(
    null,
  );

  // If accessed with legacy ?active=..., seamlessly route to the dedicated cockpit
  useEffect(() => {
    if (activeRequestId) {
      router.replace(ROUTES.patient.track(activeRequestId));
    }
  }, [activeRequestId, router]);

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

      <PaymentGatewayModal
        isOpen={Boolean(paymentRequest)}
        onClose={() => setPaymentRequest(null)}
        request={paymentRequest}
      />
    </div>
  );
}
