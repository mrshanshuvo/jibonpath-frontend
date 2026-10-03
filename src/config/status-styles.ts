import {
  TriangleAlert,
  Square,
  Circle,
  CircleDashed,
  Clock,
  Send,
  Navigation,
  CircleCheck,
  CircleX,
  Wrench,
  CircleOff,
  Undo2,
  UserCheck,
  Hospital,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import {
  Priority,
  RequestStatus,
  DispatchStatus,
  AmbulanceStatus,
  PaymentStatus,
} from "@/types/entities.types";
import { BadgeVariant, BadgeAppearance } from "@/components/shared/Badge";

export interface StatusConfig {
  variant: BadgeVariant;
  appearance: BadgeAppearance;
  label: string;
  icon: LucideIcon;
}

/**
 * Patient Priority (P1/P2/P3/P4)
 * Uses SOLID appearance to guarantee visual priority and contrast in emergency queues.
 */
export function getPriorityConfig(priority: Priority): StatusConfig {
  switch (priority) {
    case Priority.CRITICAL:
      return {
        variant: "emergency",
        appearance: "solid",
        label: "P1 Critical",
        icon: TriangleAlert,
      };
    case Priority.HIGH:
      return {
        variant: "warning",
        appearance: "solid",
        label: "P2 High",
        icon: Square,
      };
    case Priority.MEDIUM:
      return {
        variant: "info",
        appearance: "solid",
        label: "P3 Medium",
        icon: Circle,
      };
    case Priority.LOW:
    default:
      return {
        variant: "secondary",
        appearance: "solid",
        label: "P4 Low",
        icon: CircleDashed,
      };
  }
}

/**
 * Patient Emergency Request Status
 * Uses TINT appearance with accessible ink text tokens.
 */
export function getRequestStatusConfig(status: RequestStatus): StatusConfig {
  switch (status) {
    case RequestStatus.PENDING:
      return {
        variant: "warning",
        appearance: "tint",
        label: "Pending",
        icon: Clock,
      };
    case RequestStatus.DISPATCHED:
      return {
        variant: "info",
        appearance: "tint",
        label: "Dispatched",
        icon: Send,
      };
    case RequestStatus.COMPLETED:
      return {
        variant: "success",
        appearance: "tint",
        label: "Completed",
        icon: CircleCheck,
      };
    case RequestStatus.CANCELLED:
    default:
      return {
        variant: "secondary",
        appearance: "tint",
        label: "Cancelled",
        icon: CircleX,
      };
  }
}

/**
 * Driver Active Dispatch 6-stage telemetry advancement
 */
export function getDispatchStatusConfig(status: DispatchStatus): StatusConfig {
  switch (status) {
    case DispatchStatus.DISPATCHED:
      return {
        variant: "info",
        appearance: "tint",
        label: "Dispatched",
        icon: Send,
      };
    case DispatchStatus.EN_ROUTE:
      return {
        variant: "info",
        appearance: "tint",
        label: "En Route",
        icon: Navigation,
      };
    case DispatchStatus.PATIENT_PICKUP:
      return {
        variant: "primary",
        appearance: "tint",
        label: "Patient Picked Up",
        icon: UserCheck,
      };
    case DispatchStatus.HOSPITAL_SELECTED:
      return {
        variant: "primary",
        appearance: "tint",
        label: "Hospital Selected",
        icon: Hospital,
      };
    case DispatchStatus.HOSPITAL_ARRIVAL:
      return {
        variant: "primary",
        appearance: "tint",
        label: "Arrived at Hospital",
        icon: MapPin,
      };
    case DispatchStatus.COMPLETED:
    default:
      return {
        variant: "success",
        appearance: "tint",
        label: "Mission Completed",
        icon: CircleCheck,
      };
  }
}

/**
 * Ambulance Fleet Telemetry Status
 */
export function getAmbulanceStatusConfig(status: AmbulanceStatus): StatusConfig {
  switch (status) {
    case AmbulanceStatus.AVAILABLE:
      return {
        variant: "success",
        appearance: "tint",
        label: "Available",
        icon: CircleCheck,
      };
    case AmbulanceStatus.DISPATCHED:
      return {
        variant: "info",
        appearance: "tint",
        label: "On Mission",
        icon: Navigation,
      };
    case AmbulanceStatus.MAINTENANCE:
      return {
        variant: "warning",
        appearance: "tint",
        label: "Maintenance",
        icon: Wrench,
      };
    case AmbulanceStatus.RETIRED:
    default:
      return {
        variant: "secondary",
        appearance: "tint",
        label: "Retired",
        icon: CircleOff,
      };
  }
}

/**
 * Payment Transaction Status
 */
export function getPaymentStatusConfig(status: PaymentStatus): StatusConfig {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return {
        variant: "success",
        appearance: "tint",
        label: "Paid",
        icon: CircleCheck,
      };
    case PaymentStatus.PENDING:
      return {
        variant: "warning",
        appearance: "tint",
        label: "Pending",
        icon: Clock,
      };
    case PaymentStatus.FAILED:
      return {
        variant: "destructive",
        appearance: "tint",
        label: "Payment Failed",
        icon: CircleX,
      };
    case PaymentStatus.REFUNDED:
    default:
      return {
        variant: "secondary",
        appearance: "tint",
        label: "Refunded",
        icon: Undo2,
      };
  }
}
