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

          <div className="flex items-center gap-1 text-3xs font-mono text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{formatRelativeTime(request.createdAt)}</span>
          </div>
        </header>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-foreground">
            <MapPin
              className="h-4 w-4 shrink-0 text-emergency mt-0.5"
              aria-hidden="true"
            />
            <span>{request.pickupAddress}</span>
          </div>

          {request.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
              {request.description}
            </p>
          )}
        </div>

        {request.dispatch && (
          <section
            aria-label="Active dispatch information"
            className="mt-4 rounded-lg border border-border/60 bg-surface/50 p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between text-2xs font-semibold text-primary">
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
        <div className="text-3xs font-mono text-muted-foreground">
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
