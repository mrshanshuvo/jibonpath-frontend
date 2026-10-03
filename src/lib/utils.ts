import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Priority,
  RequestStatus,
  DispatchStatus,
  AmbulanceStatus,
  AmbulanceType,
  PaymentStatus,
} from "@/types/entities.types";
import { ApiError } from "@/types/api.types";

/**
 * Combines conditional classes using clsx and merges Tailwind classes cleanly
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string or Date object into human-readable format (e.g. Oct 3, 2026)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Formats an ISO date string or Date object with time (e.g. Oct 3, 2026, 10:45 AM)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(d);
}

/**
 * Formats time only (e.g. 10:45 AM)
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(d);
}

/**
 * Formats relative time (e.g. "Just now", "5 mins ago", "2 hours ago")
 */
export function formatRelativeTime(
  date: string | Date | null | undefined,
): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

/**
 * Formats a monetary number into standard Bangladeshi Taka currency (৳)
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = "BDT",
): string {
  if (amount == null) return "৳0.00";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return currency === "BDT" ? `৳${formatted}` : `${currency} ${formatted}`;
}

/**
 * Formats distance in km or meters
 */
export function formatDistance(
  kmOrMeters: number | null | undefined,
  isKm = true,
): string {
  if (kmOrMeters == null) return "N/A";
  const km = isKm ? kmOrMeters : kmOrMeters / 1000;
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Formats phone number for display (e.g. 01700-000001)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "N/A";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Extracts initials from a user's full name (e.g. "System Admin" -> "SA")
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Safely extracts user-friendly error message from any error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred. Please try again.";
}

/**
 * Color badge utility for Priority enum
 */
export function getPriorityStyles(priority: Priority): {
  badge: string;
  dot: string;
  label: string;
} {
  switch (priority) {
    case Priority.CRITICAL:
      return {
        badge: "bg-red-500/10 text-red-500 border-red-500/20",
        dot: "bg-red-500 animate-pulse",
        label: "Critical",
      };
    case Priority.HIGH:
      return {
        badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        dot: "bg-amber-500",
        label: "High Priority",
      };
    case Priority.MEDIUM:
      return {
        badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        dot: "bg-blue-500",
        label: "Medium Priority",
      };
    case Priority.LOW:
    default:
      return {
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        dot: "bg-slate-400",
        label: "Low Priority",
      };
  }
}

/**
 * Color badge utility for RequestStatus enum
 */
export function getRequestStatusStyles(status: RequestStatus): {
  badge: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case RequestStatus.PENDING:
      return {
        badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        dot: "bg-amber-500 animate-pulse",
        label: "Pending Dispatch",
      };
    case RequestStatus.DISPATCHED:
      return {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dot: "bg-blue-400",
        label: "Dispatched",
      };
    case RequestStatus.COMPLETED:
      return {
        badge: "bg-emerald-500/10 text-success border-emerald-500/20",
        dot: "bg-emerald-400",
        label: "Completed",
      };
    case RequestStatus.CANCELLED:
      return {
        badge: "bg-rose-500/10 text-destructive/80 border-rose-500/20",
        dot: "bg-rose-400",
        label: "Cancelled",
      };
    default:
      return {
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        dot: "bg-slate-400",
        label: status,
      };
  }
}

/**
 * Color badge utility for DispatchStatus enum
 */
export function getDispatchStatusStyles(status: DispatchStatus): {
  badge: string;
  label: string;
} {
  switch (status) {
    case DispatchStatus.DISPATCHED:
      return {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Dispatched",
      };
    case DispatchStatus.EN_ROUTE:
      return {
        badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        label: "En Route",
      };
    case DispatchStatus.PATIENT_PICKUP:
      return {
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "Patient Picked Up",
      };
    case DispatchStatus.HOSPITAL_SELECTED:
      return {
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        label: "Hospital Selected",
      };
    case DispatchStatus.HOSPITAL_ARRIVAL:
      return {
        badge: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        label: "Arrived at Hospital",
      };
    case DispatchStatus.COMPLETED:
      return {
        badge: "bg-emerald-500/10 text-success border-emerald-500/20",
        label: "Completed",
      };
    default:
      return {
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        label: status,
      };
  }
}

/**
 * Color badge utility for AmbulanceStatus enum
 */
export function getAmbulanceStatusStyles(status: AmbulanceStatus): {
  badge: string;
  label: string;
} {
  switch (status) {
    case AmbulanceStatus.AVAILABLE:
      return {
        badge: "bg-emerald-500/10 text-success border-emerald-500/20",
        label: "Available",
      };
    case AmbulanceStatus.DISPATCHED:
      return {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "On Mission",
      };
    case AmbulanceStatus.MAINTENANCE:
      return {
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Maintenance",
      };
    case AmbulanceStatus.RETIRED:
      return {
        badge: "bg-slate-600/10 text-slate-500 border-slate-600/20",
        label: "Retired",
      };
    default:
      return {
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        label: status,
      };
  }
}

/**
 * Color badge utility for PaymentStatus enum
 */
export function getPaymentStatusStyles(status: PaymentStatus): {
  badge: string;
  label: string;
} {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return {
        badge: "bg-emerald-500/10 text-success border-emerald-500/20",
        label: "Paid",
      };
    case PaymentStatus.PENDING:
      return {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Pending",
      };
    case PaymentStatus.FAILED:
      return {
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Failed",
      };
    case PaymentStatus.REFUNDED:
      return {
        badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        label: "Refunded",
      };
    default:
      return {
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        label: status,
      };
  }
}

/**
 * Human-readable label for AmbulanceType
 */
export function getAmbulanceTypeLabel(type: AmbulanceType): string {
  switch (type) {
    case AmbulanceType.BASIC:
      return "Basic Life Support (BLS)";
    case AmbulanceType.ADVANCED_LIFE_SUPPORT:
      return "Advanced Life Support (ALS)";
    case AmbulanceType.INTENSIVE_CARE:
      return "Mobile ICU (MICU)";
    default:
      return type;
  }
}
