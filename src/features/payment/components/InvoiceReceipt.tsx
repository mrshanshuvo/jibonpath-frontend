"use client";

import { Printer, Ambulance, ShieldCheck, CheckCircle } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Payment } from "@/types/entities.types";

interface InvoiceReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function InvoiceReceipt({
  isOpen,
  onClose,
  payment,
}: InvoiceReceiptProps) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Transport Tax Invoice"
      description="Official digital receipt for pre-hospital emergency medical service."
      className="max-w-xl"
    >
      <div className="space-y-6">
        {/* Printable Paper Card */}
        <div className="rounded-xl border border-border/80 bg-surface/50 p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emergency text-white">
                <Ambulance className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-foreground leading-tight block">
                  PulsePoint Dispatch Systems
                </span>
                <span className="text-3xs text-muted-foreground">
                  Emergency Medical Transport Services
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-2xs font-bold text-success border border-emerald-500/20">
                <CheckCircle className="h-3 w-3" />
                PAID & SETTLED
              </span>
              <p className="text-3xs font-mono text-muted-foreground mt-1">
                INV-{payment.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Billing Date & Time
              </span>
              <span className="font-mono text-foreground mt-0.5 block">
                {formatDateTime(payment.createdAt)}
              </span>
            </div>

            <div>
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Payment Gateway & Channel
              </span>
              <span className="font-medium text-foreground mt-0.5 block">
                {payment.gateway} Gateway
              </span>
            </div>

            <div>
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Gateway Reference TXN
              </span>
              <span className="font-mono text-3xs text-muted-foreground mt-0.5 block truncate">
                {payment.gatewayTxnId || `TXN-${payment.id.slice(0, 12)}`}
              </span>
            </div>

            <div>
              <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Associated Request ID
              </span>
              <span className="font-mono text-3xs text-muted-foreground mt-0.5 block">
                #{payment.requestId.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border-t border-b border-border/60 py-3 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>
                Emergency Ambulance Mobile Dispatch (Metropolitan Dhaka):
              </span>
              <span className="font-mono text-foreground">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Onboard Vital Monitoring & Resuscitation Equipment:</span>
              <span className="font-mono text-success">Included</span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-foreground">
              Total Paid:
            </span>
            <span className="font-mono text-xl font-extrabold text-primary">
              {formatCurrency(payment.amount)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-3xs text-muted-foreground justify-center pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>
              Electronically verified digital tax receipt. Valid for health
              insurance claims.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
