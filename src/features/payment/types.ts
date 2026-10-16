import { z } from "zod";
import {
  PaymentGateway,
  PaymentStatus,
  type Payment,
} from "@/types/entities.types";

export const initiatePaymentSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  gateway: z.nativeEnum(PaymentGateway),
  amount: z.number().positive().optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus | "ALL";
  search?: string;
}

export interface PaymentsApiResponse {
  data: Payment[];
  payments: Payment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  links?: import("@/types/api.types").PaginationLinks;
}

export interface FareBreakdown {
  ambulanceType: string;
  baseFare: number;
  priority: string;
  prioritySurcharge: number;
  distanceKm: number;
  ratePerKm: number;
  distanceFare: number;
  totalFare: number;
}

export interface FareEstimate {
  request?: {
    id: string;
    priority: string;
    status: string;
    pickupAddress?: string;
    ambulance?: { vehicleNumber: string; type: string } | null;
    hospital?: { name: string; address: string } | null;
  };
  fare: FareBreakdown;
  // Compatibility fallbacks
  baseFare?: number;
  distanceKm?: number;
  ratePerKm?: number;
  distanceFare?: number;
  totalFare?: number;
}

export interface CheckoutResponse {
  url?: string; // Stripe or generic checkout URL
  bkashURL?: string; // bKash payment URL
  paymentID?: string;
  GatewayPageURL?: string; // SSLCommerz gateway URL
  gatewayUrl?: string; // SSLCommerz camelCase gateway URL
  gatewayPageURL?: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  sessionId?: string;
}
