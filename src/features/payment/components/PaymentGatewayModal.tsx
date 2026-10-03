"use client";

import { useState } from "react";
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { PaymentGateway, type EmergencyRequest } from "@/types/entities.types";
import { useFareEstimate, useInitiatePayment } from "../api/payment.queries";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
}

const GATEWAYS = [
  {
    id: PaymentGateway.BKASH,
    name: "bKash Digital Payment",
    badge: "Most Popular in BD",
    desc: "Instant payment via bKash mobile balance, OTP, and PIN confirmation",
    icon: Smartphone,
    border: "border-pink-500/40 hover:border-pink-500 hover:bg-pink-950/20",
    activeRing: "ring-2 ring-pink-500 bg-pink-500/10",
    badgeStyle: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  },
  {
    id: PaymentGateway.SSLCOMMERZ,
    name: "SSLCommerz Multi-Gateway",
    badge: "Cards, Nagad, Rocket",
    desc: "Visa, MasterCard, American Express, Nagad, Rocket, Upay, and 30+ BD banks",
    icon: CreditCard,
    border: "border-amber-500/40 hover:border-amber-500 hover:bg-amber-950/20",
    activeRing: "ring-2 ring-amber-500 bg-amber-500/10",
    badgeStyle: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    id: PaymentGateway.STRIPE,
    name: "Stripe Global Checkout",
    badge: "International Cards",
    desc: "Seamless 256-bit encrypted card checkout supporting all international debit and credit cards",
    icon: ShieldCheck,
    border: "border-indigo-500/40 hover:border-indigo-500 hover:bg-indigo-950/20",
    activeRing: "ring-2 ring-indigo-500 bg-indigo-500/10",
    badgeStyle: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
];

export function PaymentGatewayModal({
  isOpen,
  onClose,
  request,
}: PaymentGatewayModalProps) {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(
    PaymentGateway.BKASH,
  );

  const { data: fareData, isLoading: fareLoading } = useFareEstimate(
    request?.id,
  );
  const initiateMutation = useInitiatePayment();

  if (!request) return null;

  const estimatedTotal = fareData?.totalFare || 2500;
  const baseFare = fareData?.baseFare || 1500;
  const distanceKm = fareData?.estimatedDistanceKm || 12;
  const perKmRate = fareData?.perKmRate || 55;

  const handlePay = () => {
    initiateMutation.mutate({
      requestId: request.id,
      gateway: selectedGateway,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Emergency Transport Fee"
      description="Choose your preferred payment gateway for immediate automated billing settlement."
      className="max-w-xl"
    >
      <div className="space-y-6">
        {/* Fare Summary Breakdown */}
        <div className="rounded-xl border border-border/80 bg-surface/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="h-4 w-4 text-primary" />
              Fare Estimation Breakdown
            </span>
            <span className="font-mono text-3xs text-muted-foreground">
              Req #{request.id.slice(0, 8)}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
            <div className="flex justify-between">
              <span>Ambulance Base Activation:</span>
              <span className="font-mono text-foreground">{formatCurrency(baseFare)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Metropolitan Transit ({distanceKm} km × {formatCurrency(perKmRate)}):</span>
              <span className="font-mono text-foreground">
                {formatCurrency(distanceKm * perKmRate)}
              </span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Onboard Oxygen & Paramedic Resuscitation:</span>
              <span className="font-mono font-medium">Included (৳ 0)</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/60 pt-2 mt-1">
              <span>Total Payable Amount:</span>
              <span className="font-mono text-base text-primary">
                {fareLoading ? "Calculating..." : formatCurrency(estimatedTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Gateway Selection Cards */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Payment Method:
          </label>

          <div className="space-y-2.5">
            {GATEWAYS.map((gw) => {
              const Icon = gw.icon;
              const isSelected = selectedGateway === gw.id;

              return (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setSelectedGateway(gw.id)}
                  className={cn(
                    "w-full flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-150 cursor-pointer bg-card/60",
                    gw.border,
                    isSelected ? gw.activeRing : "opacity-85 hover:opacity-100",
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/80 shadow-xs border border-border/50 text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-foreground">
                        {gw.name}
                      </span>
                      <span
                        className={cn(
                          "text-3xs font-medium px-2 py-0.5 rounded-full border",
                          gw.badgeStyle,
                        )}
                      >
                        {gw.badge}
                      </span>
                    </div>
                    <p className="text-3xs text-muted-foreground mt-0.5 leading-normal">
                      {gw.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
          <Button variant="ghost" onClick={onClose} disabled={initiateMutation.isPending}>
            Dismiss
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="font-bold px-6 shadow-md shadow-primary/25 cursor-pointer"
            isLoading={initiateMutation.isPending}
            onClick={handlePay}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Pay {formatCurrency(estimatedTotal)} via {selectedGateway}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
