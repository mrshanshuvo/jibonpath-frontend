"use client";

import { useState } from "react";
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Receipt,
  ArrowRight,
  Info,
} from "lucide-react";
import { Modal, Button } from "@/components/shared";
import { PaymentGateway, type EmergencyRequest } from "@/types/entities.types";
import { useFareEstimate, useInitiatePayment } from "../api/payment.queries";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
  defaultGateway?: PaymentGateway;
}

const GATEWAYS = [
  {
    id: PaymentGateway.BKASH,
    name: "bKash Digital Payment",
    badge: "Most Popular in BD",
    desc: "Instant payment via bKash mobile balance, OTP, and PIN confirmation",
    icon: Smartphone,
  },
  {
    id: PaymentGateway.SSLCOMMERZ,
    name: "SSLCommerz Multi-Gateway",
    badge: "Cards, Nagad, Rocket",
    desc: "Visa, MasterCard, American Express, Nagad, Rocket, Upay, and 30+ BD banks",
    icon: CreditCard,
  },
  {
    id: PaymentGateway.STRIPE,
    name: "Stripe Global Checkout",
    badge: "International Cards",
    desc: "Seamless 256-bit encrypted card checkout supporting all international debit and credit cards",
    icon: ShieldCheck,
  },
];

export function PaymentGatewayModal({
  isOpen,
  onClose,
  request,
  defaultGateway,
}: PaymentGatewayModalProps) {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(
    defaultGateway || PaymentGateway.BKASH,
  );
  const [useSandboxFastTest, setUseSandboxFastTest] = useState(false);

  const { data: fareData, isLoading: fareLoading } = useFareEstimate(
    request?.id,
  );
  const initiateMutation = useInitiatePayment();

  if (!request) return null;

  const estimatedTotal = fareData?.totalFare || 2500;
  const baseFare = fareData?.baseFare || 1500;
  const distanceKm = fareData?.estimatedDistanceKm || 12;
  const perKmRate = fareData?.perKmRate || 55;

  const isFastTest =
    selectedGateway === PaymentGateway.BKASH && useSandboxFastTest;
  const payableAmount = isFastTest ? 10 : estimatedTotal;

  const handlePay = () => {
    initiateMutation.mutate({
      requestId: request.id,
      gateway: selectedGateway,
      amount: isFastTest ? 10 : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      title="Settle Emergency Transport Fee"
      description="Choose your preferred payment gateway for immediate automated billing settlement."
      className="p-6 sm:p-7"
      titleClassName="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
      descriptionClassName="text-sm text-muted-foreground mt-0.5 leading-normal"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
        {/* Left Column: Gateway Selection & Credentials (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-3.5">
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Select Payment Method:
            </label>

            <div className="space-y-2">
              {GATEWAYS.map((gw) => {
                const Icon = gw.icon;
                const isSelected = selectedGateway === gw.id;

                return (
                  <button
                    key={gw.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedGateway(gw.id)}
                    className={cn(
                      "w-full flex items-center gap-3.5 rounded-xl border p-3 text-left transition-all duration-150 cursor-pointer bg-card",
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 bg-primary-soft/30 shadow-xs"
                        : "border-border hover:border-primary/40 hover:bg-surface-raised opacity-90 hover:opacity-100",
                    )}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background border border-border text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm sm:text-base text-foreground">
                          {gw.name}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md border border-border bg-surface-raised text-muted-foreground shrink-0">
                          {gw.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {gw.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gateway-specific Details / Sandbox Credentials */}
          {selectedGateway === PaymentGateway.BKASH && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-400">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>bKash Sandbox Simulator Credentials</span>
                </div>
                <span className="text-xs font-mono font-semibold text-sky-300">
                  Test Sandbox
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="bg-background p-2 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground block uppercase font-medium">
                    Wallet
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground select-all mt-0.5 block">
                    01770618576
                  </span>
                </div>
                <div className="bg-background p-2 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground block uppercase font-medium">
                    OTP Code
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground select-all mt-0.5 block">
                    123456
                  </span>
                </div>
                <div className="bg-background p-2 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground block uppercase font-medium">
                    PIN
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground select-all mt-0.5 block">
                    12121
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
                <div className="text-muted-foreground">
                  <span>Alt: </span>
                  <span className="font-mono text-sky-300 font-bold select-all">
                    01619777282
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    type="button"
                    onClick={() => setUseSandboxFastTest(false)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold transition-all border cursor-pointer",
                      !useSandboxFastTest
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-surface-raised",
                    )}
                  >
                    Full Fare
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseSandboxFastTest(true)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-semibold transition-all border cursor-pointer",
                      useSandboxFastTest
                        ? "bg-sky-500 text-white border-sky-500"
                        : "border-border text-muted-foreground hover:bg-surface-raised",
                    )}
                  >
                    Fast Test (৳10)
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedGateway === PaymentGateway.SSLCOMMERZ && (
            <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1.5 text-xs text-muted-foreground animate-in fade-in duration-150">
              <div className="font-bold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>SSLCommerz Multi-Gateway Engine</span>
              </div>
              <p className="leading-relaxed">
                Supports all Bangladeshi debit/credit cards, Visa, MasterCard,
                Amex, Nagad, Rocket, Upay, and 30+ domestic online banking
                portals.
              </p>
            </div>
          )}

          {selectedGateway === PaymentGateway.STRIPE && (
            <div className="rounded-xl border border-border bg-surface p-3.5 space-y-1.5 text-xs text-muted-foreground animate-in fade-in duration-150">
              <div className="font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Stripe Global Encrypted Checkout</span>
              </div>
              <p className="leading-relaxed">
                Supports all international debit and credit cards with 256-bit
                bank-grade encryption and automated SCA authentication.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Checkout Actions (5 cols) */}
        <div className="md:col-span-5 rounded-xl border border-border bg-surface p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-primary" />
                Fare Estimation
              </span>
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                #{request.id.slice(0, 8)}
              </span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Base Activation:</span>
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(baseFare)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  Transit ({distanceKm} km × {formatCurrency(perKmRate)}):
                </span>
                <span className="font-mono font-medium text-foreground">
                  {formatCurrency(distanceKm * perKmRate)}
                </span>
              </div>
              <div className="flex justify-between text-success">
                <span>Paramedic & Oxygen:</span>
                <span className="font-mono font-semibold">Included (৳ 0)</span>
              </div>
            </div>

            {/* Total Payable Card */}
            <div className="rounded-lg bg-background p-3.5 border border-border flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-muted-foreground block">
                  Total Payable
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {isFastTest ? "৳10 Test Override" : "Standard Fare"}
                </span>
              </div>
              <span className="font-mono text-xl sm:text-2xl text-primary font-extrabold">
                {fareLoading ? "..." : formatCurrency(payableAmount)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Instant automated dispatch release upon settlement.</span>
            </div>
          </div>

          {/* Action Buttons in right column */}
          <div className="space-y-2 pt-3 border-t border-border">
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold h-12 text-sm sm:text-base justify-center cursor-pointer"
              isLoading={initiateMutation.isPending}
              disabled={
                fareLoading ||
                initiateMutation.isPending ||
                !payableAmount ||
                payableAmount <= 0
              }
              onClick={handlePay}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              {fareLoading
                ? "Calculating Fare..."
                : `Pay ${formatCurrency(payableAmount)} via ${selectedGateway}`}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs font-medium text-muted-foreground hover:text-foreground h-8 cursor-pointer"
              onClick={onClose}
              disabled={initiateMutation.isPending}
            >
              Cancel & Return
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
