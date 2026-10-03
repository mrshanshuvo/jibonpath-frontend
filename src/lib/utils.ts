import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AmbulanceType } from "@/types/entities.types";
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
