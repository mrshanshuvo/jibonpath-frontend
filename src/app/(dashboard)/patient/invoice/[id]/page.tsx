"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { InvoicePaper } from "@/features/payment/components/InvoiceReceipt";
import { usePaymentDetail } from "@/features/payment/api/payment.queries";
import { TableSkeleton } from "@/components/skeletons";

export default function PatientInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: payment, isLoading, error } = usePaymentDetail(id);

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <TableSkeleton showHeader={true} rowCount={3} />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="w-full text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We couldn&apos;t find an invoice matching reference ID #{id}.
        </p>
        <Link href="/patient/payments">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Payments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full py-6 space-y-6">
      {/* Top action navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/patient/payments">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            All Payments
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Print Invoice
        </Button>
      </div>

      <InvoicePaper payment={payment} />
    </div>
  );
}
