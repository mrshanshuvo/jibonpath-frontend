import { z } from "zod";
import {
  PaymentGateway,
  PaymentStatus,
  type Payment,
} from "@/types/entities.types";

export const initiatePaymentSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  gateway: z.nativeEnum(PaymentGateway),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus | "ALL";
}

export interface PaymentsApiResponse {
  payments: Payment[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface FareEstimate {
  requestId: string;
  ambulanceType: string;
  baseFare: number;
  estimatedDistanceKm: number;
  perKmRate: number;
  totalFare: number;
  currency: string;
}

export interface CheckoutResponse {
  url?: string; // Stripe checkout URL
  bkashURL?: string; // bKash payment URL
  paymentID?: string;
  GatewayPageURL?: string; // SSLCommerz gateway URL
  sessionId?: string;
}
