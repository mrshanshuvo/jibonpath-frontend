import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Priority, RequestStatus, DispatchStatus, AmbulanceStatus } from "@/types/entities.types";

/**
 * Combines conditional classes using clsx and merges Tailwind classes cleanly
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an ISO date string or Date object into human-readable format
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
 * Formats an ISO date string or Date object with time
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
 * Formats a monetary number into standard currency
 */
export function formatCurrency(amount: number | null | undefined, currency = "BDT"): string {
  if (amount == null) return "0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "BDT" ? "BDT" : currency,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace("BDT", "৳");
}

/**
 * Formats phone number for display
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "N/A";
  return phone.replace(/(\d{5})(\d{6})/, "$1-$2");
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
 * Color badge utility for DispatchStatus enum
 */
export function getDispatchStatusStyles(status: DispatchStatus): {
  badge: string;
  label: string;
} {
  switch (status) {
    case DispatchStatus.DISPATCHED:
      return { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Dispatched" };
    case DispatchStatus.EN_ROUTE:
      return { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "En Route" };
    case DispatchStatus.PATIENT_PICKUP:
      return { badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Patient Picked Up" };
    case DispatchStatus.HOSPITAL_SELECTED:
      return { badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "Hospital Selected" };
    case DispatchStatus.HOSPITAL_ARRIVAL:
      return { badge: "bg-teal-500/10 text-teal-400 border-teal-500/20", label: "Arrived at Hospital" };
    case DispatchStatus.COMPLETED:
      return { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Completed" };
    default:
      return { badge: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: status };
  }
}

/**
 * Color badge utility for AmbulanceStatus
 */
export function getAmbulanceStatusStyles(status: AmbulanceStatus): {
  badge: string;
  label: string;
} {
  switch (status) {
    case AmbulanceStatus.AVAILABLE:
      return { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Available" };
    case AmbulanceStatus.DISPATCHED:
      return { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "On Mission" };
    case AmbulanceStatus.MAINTENANCE:
      return { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Maintenance" };
    case AmbulanceStatus.RETIRED:
      return { badge: "bg-slate-600/10 text-slate-500 border-slate-600/20", label: "Retired" };
    default:
      return { badge: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: status };
  }
}
