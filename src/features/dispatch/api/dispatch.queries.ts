"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { Dispatch } from "@/types/entities.types";
import type {
  CreateDispatchInput,
  DispatchQueryParams,
  DispatchesApiResponse,
  UpdateDispatchStatusInput,
} from "../types";

export const dispatchKeys = {
  all: ["dispatch"] as const,
  list: (params?: DispatchQueryParams) =>
    [...dispatchKeys.all, "list", params] as const,
  activeDriver: () => [...dispatchKeys.all, "activeDriver"] as const,
  detail: (id: string) => [...dispatchKeys.all, "detail", id] as const,
};

/**
 * useDispatches:
 * Fetches paginated dispatches (for Admin or Driver history)
 */
export function useDispatches(params?: DispatchQueryParams) {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status && params.status !== "ALL") queryParams.status = params.status;

  return useQuery({
    queryKey: dispatchKeys.list(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<DispatchesApiResponse>>("/dispatches", {
        params: queryParams,
      });
      return res.data;
    },
    refetchInterval: 10000,
  });
}

/**
 * useActiveDriverDispatch:
 * Polled query for a paramedic driver's ongoing emergency assignment
 */
export function useActiveDriverDispatch() {
  return useQuery({
    queryKey: dispatchKeys.activeDriver(),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Dispatch | null>>("/dispatches/my-active");
      return res.data;
    },
    refetchInterval: 5000, // High-frequency polling for driver cockpit
  });
}

/**
 * useDispatch:
 * Single dispatch details with full trip logs and telemetry
 */
export function useDispatch(id?: string) {
  return useQuery({
    queryKey: dispatchKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Dispatch ID is required");
      const res = await api.get<ApiResponse<Dispatch>>(`/dispatches/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
    refetchInterval: 5000,
  });
}

/**
 * useCreateDispatch:
 * Admin assigns an ambulance and driver to an emergency request
 */
export function useCreateDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDispatchInput): Promise<Dispatch> => {
      const res = await api.post<ApiResponse<Dispatch>>("/dispatches", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
      toast.success("Ambulance unit dispatched successfully!");
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create dispatch assignment.");
    },
  });
}

/**
 * useUpdateDispatchStatus:
 * Driver or Admin steps the trip status through the 6 stages
 */
export function useUpdateDispatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateDispatchStatusInput;
    }): Promise<Dispatch> => {
      const res = await api.patch<ApiResponse<Dispatch>>(
        `/dispatches/${id}/status`,
        input,
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
      toast.success(`Trip status updated to: ${data.status}`);
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update trip status.");
    },
  });
}
