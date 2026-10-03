"use client";

import { useState } from "react";
import { RequestList } from "@/features/emergency";
import { PaymentGatewayModal } from "@/features/payment";
import type { EmergencyRequest } from "@/types/entities.types";

export default function PatientDashboardPage() {
  const [paymentRequest, setPaymentRequest] = useState<EmergencyRequest | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Emergency Ambulance Requests
            </h1>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emergency animate-ping" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track active ambulance dispatches, monitor arrival telemetry, and
            manage past medical transit history.
          </p>
        </div>
      </div>

      {/* Request List */}
      <RequestList onPay={(req) => setPaymentRequest(req)} />

      {/* Payment Settlement Modal */}
      <PaymentGatewayModal
        isOpen={Boolean(paymentRequest)}
        onClose={() => setPaymentRequest(null)}
        request={paymentRequest}
      />
    </div>
  );
}
