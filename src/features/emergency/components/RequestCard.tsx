"use client";

import Link from "next/link";
import {
  MapPin,
  Clock,
  Ambulance,
  User,
  CreditCard,
  Ban,
  Radio,
  Phone,
  Building2,
} from "lucide-react";
import { Button, Badge, StatusBadge } from "@/components/shared";
import { ROUTES } from "@/config/routes";
import {
  RequestStatus,
  PaymentStatus,
  type EmergencyRequest,
} from "@/types/entities.types";
import { formatRelativeTime } from "@/lib/utils";
import { useCancelRequest } from "../api/emergency.queries";

export interface ParsedDescription {
  notes?: string;
  phone?: string;
  hospital?: string;
}

export function parseRequestDescription(
  raw?: string | null,
): ParsedDescription {
  if (!raw?.trim()) return {};

  let text = raw.trim();
  let phone: string | undefined;
  let hospital: string | undefined;

  // 1. Bracketed format: [Callback: 017...] or [Phone: 017...]
  const bracketMatch = text.match(/\[(?:Callback|Phone):\s*([^\]]+)\]/i);
  if (bracketMatch) {
    phone = bracketMatch[1].trim();
    text = text.replace(bracketMatch[0], "").trim();
  }

  // 2. Pipe-delimited parts: "Symptoms... | Callback Phone: ... | Destination: ..."
  const parts = text
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
  const remainingNotes: string[] = [];

  for (const part of parts) {
    const callbackMatch = part.match(
      /^(?:Callback\s*Phone|Callback|Phone):\s*(.+)$/i,
    );
    const destMatch = part.match(/^(?:Destination|Hospital):\s*(.+)$/i);

    if (callbackMatch) {
      if (!phone) phone = callbackMatch[1].trim();
    } else if (destMatch) {
      if (!hospital) hospital = destMatch[1].trim();
    } else {
      remainingNotes.push(part);
    }
  }

  const notes = remainingNotes.join(" • ").trim();

  return {
    notes: notes || undefined,
    phone,
    hospital,
  };
}

interface RequestCardProps {
  request: EmergencyRequest;
  onPay?: (request: EmergencyRequest) => void;
}

export function RequestCard({ request, onPay }: RequestCardProps) {
  const cancelMutation = useCancelRequest();

  const isPending = request.status === RequestStatus.PENDING;
  const isDispatched = request.status === RequestStatus.DISPATCHED;
  const isCompleted = request.status === RequestStatus.COMPLETED;

  const isPaid = request.payment?.status === PaymentStatus.SUCCESS;
  const isPaymentFailed = request.payment?.status === PaymentStatus.FAILED;
  const isPaymentPending = request.payment?.status === PaymentStatus.PENDING;

  const canPay = (isCompleted || isDispatched) && !isPaid && Boolean(onPay);
  const parsedDesc = parseRequestDescription(request.description);

  return (
    <article className="rounded-lg border border-border/80 bg-card p-5 sm:p-6 shadow-sm hover:border-border transition-colors duration-200 flex flex-col justify-between gap-4">
      <div>
        <header className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <StatusBadge domain="priority" value={request.priority} size="sm" />
            <StatusBadge
              domain="request"
              value={request.status}
              size="sm"
              pulse={isDispatched}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{formatRelativeTime(request.createdAt)}</span>
          </div>
        </header>

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-foreground">
            <MapPin
              className="h-4 w-4 shrink-0 text-emergency mt-0.5"
              aria-hidden="true"
            />
            <span className="leading-snug">{request.pickupAddress}</span>
          </div>

          {/* Structured Medical & Dispatch Metadata */}
          {(parsedDesc.notes || parsedDesc.phone || parsedDesc.hospital) && (
            <div className="space-y-2 pl-6 pt-0.5">
              {/* Symptoms / Clinical Notes Callout */}
              {parsedDesc.notes && (
                <div className="rounded-lg bg-surface/70 border border-border/60 p-2.5 text-xs text-foreground/90 font-medium leading-relaxed">
                  <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-0.5">
                    Medical Notes &amp; Symptoms
                  </span>
                  <p className="line-clamp-3">{parsedDesc.notes}</p>
                </div>
              )}

              {/* Contact Phone & Destination Pills */}
              {(parsedDesc.phone || parsedDesc.hospital) && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {parsedDesc.phone && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-surface border border-border/80 px-2.5 py-1 text-xs font-mono text-muted-foreground shadow-2xs">
                      <Phone
                        className="h-3.5 w-3.5 text-primary shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-foreground font-semibold">
                        {parsedDesc.phone}
                      </span>
                    </div>
                  )}

                  {parsedDesc.hospital && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-surface border border-border/80 px-2.5 py-1 text-xs text-muted-foreground shadow-2xs">
                      <Building2
                        className="h-3.5 w-3.5 text-emergency shrink-0"
                        aria-hidden="true"
                      />
                      <span
                        className="truncate max-w-55 text-foreground font-medium"
                        title={parsedDesc.hospital}
                      >
                        {parsedDesc.hospital}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {request.dispatch && (
          <section
            aria-label="Active dispatch information"
            className="mt-4 rounded-lg border border-border/60 bg-surface/50 p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <Radio
                  className="h-3.5 w-3.5 text-success"
                  aria-hidden="true"
                />
                Active Dispatch
              </span>
              <span className="font-mono text-muted-foreground">
                {request.dispatch.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {request.dispatch.ambulance && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Ambulance
                    className="h-3.5 w-3.5 text-primary"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {request.dispatch.ambulance.vehicleNumber}
                  </span>
                </div>
              )}
              {request.dispatch.driver?.user && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User
                    className="h-3.5 w-3.5 text-success"
                    aria-hidden="true"
                  />
                  <span className="truncate">
                    {request.dispatch.driver.user.name}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 mt-2">
        <div className="text-xs font-mono text-muted-foreground">
          ID: {request.id.slice(0, 8)}…
        </div>

        <div className="flex items-center gap-2">
          {isPending && (
            <Button
              variant="outline"
              size="sm"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(request.id)}
              leftIcon={
                <Ban
                  className="h-3.5 w-3.5 text-destructive"
                  aria-hidden="true"
                />
              }
              className="text-destructive hover:text-destructive/80"
            >
              Cancel Request
            </Button>
          )}

          {isDispatched && (
            <Link href={`${ROUTES.PATIENT.DASHBOARD}?active=${request.id}`}>
              <Button
                variant="emergency"
                size="sm"
                leftIcon={<Radio className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Track Live
              </Button>
            </Link>
          )}

          {isPaid && (
            <Badge variant="success" size="sm">
              PAID ৳ {request.payment?.amount}
            </Badge>
          )}

          {isPaymentFailed && (
            <Badge variant="destructive" size="sm">
              Payment Failed
            </Badge>
          )}

          {isPaymentPending && (
            <Badge variant="warning" size="sm">
              Payment Pending
            </Badge>
          )}

          {canPay && (
            <Button
              variant={isPaymentFailed ? "destructive" : "primary"}
              size="sm"
              onClick={() => onPay?.(request)}
              leftIcon={
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              }
            >
              {isPaymentFailed ? "Retry Payment" : "Settle Fee"}
            </Button>
          )}
        </div>
      </footer>
    </article>
  );
}
