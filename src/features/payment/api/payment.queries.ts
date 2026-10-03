"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { PaymentGateway, type Payment } from "@/types/entities.types";
import type { ApiResponse } from "@/types/api.types";
import type {
  CheckoutResponse,
  FareEstimate,
  InitiatePaymentInput,
  PaymentQueryParams,
  PaymentsApiResponse,
} from "../types";

export const paymentKeys = {
  all: ["payment"] as const,
  myPayments: (params?: PaymentQueryParams) =>
    [...paymentKeys.all, "my", params] as const,
  fare: (requestId: string) => [...paymentKeys.all, "fare", requestId] as const,
  status: (requestId: string) =>
    [...paymentKeys.all, "status", requestId] as const,
};

/**
 * useMyPayments:
 * Fetches patient payment history or admin payment list
 */
export function useMyPayments(params?: PaymentQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status && params.status !== "ALL")
    queryParams.status = params.status;

  return useQuery({
    queryKey: paymentKeys.myPayments(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaymentsApiResponse>>(
        "/payments/my",
        {
          params: queryParams,
        },
      );
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

/**
 * useFareEstimate:
 * Fetches calculated fare breakdown for an emergency request
 */
export function useFareEstimate(requestId?: string) {
  return useQuery({
    queryKey: paymentKeys.fare(requestId || ""),
    queryFn: async () => {
      if (!requestId) throw new Error("Request ID required");
      const res = await api.get<ApiResponse<FareEstimate>>(
        `/payments/fare/${requestId}`,
      );
      return res.data;
    },
    enabled: Boolean(requestId),
  });
}

/**
 * usePaymentStatus:
 * Polls payment status for an emergency request
 */
export function usePaymentStatus(requestId?: string) {
  return useQuery({
    queryKey: paymentKeys.status(requestId || ""),
    queryFn: async () => {
      if (!requestId) throw new Error("Request ID required");
      const res = await api.get<ApiResponse<Payment>>(`/payments/${requestId}`);
      return res.data;
    },
    enabled: Boolean(requestId),
  });
}

/**
 * usePaymentDetail:
 * Fetches single payment record by payment ID
 */
export function usePaymentDetail(paymentId?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [...paymentKeys.all, "detail", paymentId || ""],
    queryFn: async () => {
      if (!paymentId) throw new Error("Payment ID required");
      const res = await api.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
      return res.data;
    },
    enabled: Boolean(paymentId) && isAuthenticated,
  });
}

/**
 * useInitiatePayment:
 * Dispatches to chosen gateway endpoint:
 * - STRIPE -> POST /payments/stripe/checkout
 * - BKASH -> POST /payments/bkash/create
 * - SSLCOMMERZ -> POST /payments/sslcommerz/initiate
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      gateway,
    }: InitiatePaymentInput): Promise<CheckoutResponse> => {
      let endpoint = "/payments/stripe/checkout";
      if (gateway === PaymentGateway.BKASH) {
        endpoint = "/payments/bkash/create";
      } else if (gateway === PaymentGateway.SSLCOMMERZ) {
        endpoint = "/payments/sslcommerz/initiate";
      }

      const res = await api.post<ApiResponse<CheckoutResponse>>(endpoint, {
        requestId,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });

      // Handle redirect to external payment page
      const redirectTarget = data.url || data.bkashURL || data.GatewayPageURL;

      if (redirectTarget) {
        toast.info(`Redirecting to secure ${variables.gateway} portal...`);
        window.location.href = redirectTarget;
      } else {
        toast.success("Payment session generated successfully");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate payment session.");
    },
  });
}
