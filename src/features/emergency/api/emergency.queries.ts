"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { EmergencyRequest } from "@/types/entities.types";
import type {
  CreateEmergencyRequestInput,
  RequestQueryParams,
  RequestsApiResponse,
} from "../types";

export const emergencyKeys = {
  all: ["emergency"] as const,
  myRequests: (params?: RequestQueryParams) =>
    [...emergencyKeys.all, "my", params] as const,
  adminRequests: (params?: RequestQueryParams) =>
    [...emergencyKeys.all, "admin", params] as const,
  detail: (id: string) => [...emergencyKeys.all, "detail", id] as const,
};

/**
 * useMyRequests:
 * Fetches the patient's own emergency requests with pagination and filters
 */
export function useMyRequests(params?: RequestQueryParams) {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status && params.status !== "ALL") queryParams.status = params.status;
  if (params?.priority && params.priority !== "ALL") queryParams.priority = params.priority;

  return useQuery({
    queryKey: emergencyKeys.myRequests(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<RequestsApiResponse>>("/requests/my", {
        params: queryParams,
      });
      return res.data;
    },
    refetchInterval: 10000, // Poll every 10s for real-time dispatch updates
  });
}

/**
 * useAdminRequests:
 * Fetches all requests across the system for administrator dispatch control
 */
export function useAdminRequests(params?: RequestQueryParams) {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status && params.status !== "ALL") queryParams.status = params.status;

  return useQuery({
    queryKey: emergencyKeys.adminRequests(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<RequestsApiResponse>>("/requests", {
        params: queryParams,
      });
      return res.data;
    },
    refetchInterval: 10000,
  });
}

/**
 * useRequest:
 * Fetches single emergency request details including caller, dispatch, and hospital
 */
export function useRequest(id?: string) {
  return useQuery({
    queryKey: emergencyKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Request ID is required");
      const res = await api.get<ApiResponse<EmergencyRequest>>(`/requests/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
    refetchInterval: 5000,
  });
}

/**
 * useCreateRequest:
 * Dispatches a new emergency ambulance request
 */
export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEmergencyRequestInput): Promise<EmergencyRequest> => {
      const res = await api.post<ApiResponse<EmergencyRequest>>("/requests", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: emergencyKeys.all });
      toast.success("Emergency request dispatched! Locating nearest ambulance...", {
        duration: 5000,
      });
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create emergency request. Please call 999 immediately.");
    },
  });
}

/**
 * useCancelRequest:
 * Cancels an active emergency request
 */
export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<EmergencyRequest> => {
      const res = await api.patch<ApiResponse<EmergencyRequest>>(`/requests/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyKeys.all });
      toast.info("Emergency request has been cancelled.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel request.");
    },
  });
}
