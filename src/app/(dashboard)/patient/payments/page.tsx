import { PaymentHistoryTable } from "@/features/payment";

export default function PatientPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Trip Payment History & Invoices
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review settled ambulance transportation fees, verify gateway transaction references, and download official medical tax receipts.
        </p>
      </div>

      <PaymentHistoryTable />
    </div>
  );
}
