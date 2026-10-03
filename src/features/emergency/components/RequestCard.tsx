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
import { Button, Badge } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import {
  RequestStatus,
  Priority,
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

  const getPriorityBadgeVariant = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL:
        return "emergency";
      case Priority.HIGH:
        return "warning";
      case Priority.MEDIUM:
        return "default";
      case Priority.LOW:
        return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return "warning";
      case RequestStatus.DISPATCHED:
        return "emergency";
      case RequestStatus.COMPLETED:
        return "success";
      case RequestStatus.CANCELLED:
        return "outline";
    }
  };

  const isPending = request.status === RequestStatus.PENDING;
  const isDispatched = request.status === RequestStatus.DISPATCHED;
  const isCompleted = request.status === RequestStatus.COMPLETED;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm hover:border-border transition-all duration-200 flex flex-col justify-between gap-4">
      <div>
        {/* Header: Priority & Status & Time */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={getPriorityBadgeVariant(request.priority)}
              size="sm"
            >
              {request.priority}
            </Badge>
            <Badge
              variant={getStatusBadgeVariant(request.status)}
              size="sm"
              pulse={isDispatched}
            >
              {request.status}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-3xs font-mono text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(request.createdAt)}</span>
          </div>
        </div>

        {/* Location & Details */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-emergency mt-0.5" />
            <span>{request.pickupAddress}</span>
          </div>

          {request.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
              {request.description}
            </p>
          )}
        </div>

        {/* Active Dispatch Info if available */}
        {request.dispatch && (
          <div className="mt-4 rounded-xl border border-border/60 bg-surface/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-2xs font-semibold text-primary">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                Active Dispatch Telemetry
              </span>
              <span className="font-mono text-muted-foreground">
                Status: {request.dispatch.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {request.dispatch.ambulance && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Ambulance className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">
                    {request.dispatch.ambulance.vehicleNumber}
                  </span>
                </div>
              )}
              {request.dispatch.driver?.user && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="truncate">
                    {request.dispatch.driver.user.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 mt-2">
        <div className="text-3xs font-mono text-muted-foreground">
          ID: {request.id.slice(0, 8)}...
        </div>

        <div className="flex items-center gap-2">
          {isPending && (
            <Button
              variant="outline"
              size="sm"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(request.id)}
              leftIcon={<Ban className="h-3.5 w-3.5 text-rose-500" />}
              className="text-rose-500 hover:text-rose-400"
            >
              Cancel Request
            </Button>
          )}

          {isDispatched && (
            <Link href={`${ROUTES.PATIENT.DASHBOARD}?active=${request.id}`}>
              <Button
                variant="emergency"
                size="sm"
                leftIcon={<Radio className="h-3.5 w-3.5 animate-pulse" />}
              >
                Track Live
              </Button>
            </Link>
          )}

          {isCompleted && !request.payment && onPay && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onPay(request)}
              leftIcon={<CreditCard className="h-3.5 w-3.5" />}
            >
              Settle Fee
            </Button>
          )}

          {isCompleted && request.payment && (
            <Badge variant="success" size="sm">
              PAID ৳ {request.payment.amount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
