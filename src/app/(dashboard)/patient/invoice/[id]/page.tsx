"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
      <div className="max-w-2xl mx-auto py-8">
        <TableSkeleton showHeader={true} rowCount={3} />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Invoice Not Found</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t find an invoice matching reference ID #{id}.
        </p>
        <Link href="/patient/payments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Top action navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/patient/payments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
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
