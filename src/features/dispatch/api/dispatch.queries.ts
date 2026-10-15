"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api.types";
import type { Dispatch } from "@/types/entities.types";
import type {
  CreateDispatchInput,
  DispatchQueryParams,
  DispatchesApiResponse,
  DriversApiResponse,
  UpdateDispatchStatusInput,
} from "../types";

export const dispatchKeys = {
  all: ["dispatch"] as const,
  list: (params?: DispatchQueryParams) =>
    [...dispatchKeys.all, "list", params] as const,
  activeDriver: () => [...dispatchKeys.all, "activeDriver"] as const,
  detail: (id: string) => [...dispatchKeys.all, "detail", id] as const,
  availableDrivers: (isAvailable?: boolean) =>
    [...dispatchKeys.all, "availableDrivers", isAvailable] as const,
};

/**
 * useDispatches:
 * Fetches paginated dispatches (for Admin or Driver history)
 */
export function useDispatches(params?: DispatchQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status && params.status !== "ALL")
    queryParams.status = params.status;
  if (params?.search) queryParams.search = params.search;

  return useQuery({
    queryKey: dispatchKeys.list(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<DispatchesApiResponse>>(
        "/dispatches",
        {
          params: queryParams,
        },
      );
      return res.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });
}

/**
 * useActiveDriverDispatch:
 * Polled query for a paramedic driver's ongoing emergency assignment
 */
export function useActiveDriverDispatch() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: dispatchKeys.activeDriver(),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Dispatch | null>>(
        "/dispatches/my-active",
      );
      return res.data;
    },
    enabled: isAuthenticated,
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

export interface AvailableDriversParams {
  page?: number;
  limit?: number;
  search?: string;
  isAvailable?: boolean;
}

/**
 * useAvailableDrivers:
 * Lists certified paramedic drivers filtered by availability for dispatch pairing with pagination and search
 */
export function useAvailableDrivers(
  params?: AvailableDriversParams,
  options?: { enabled?: boolean },
) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAvailable =
    params?.isAvailable !== undefined ? params.isAvailable : true;
  const page = params?.page;
  const limit = params?.limit;
  const search = params?.search?.trim() || undefined;

  return useQuery({
    queryKey: [
      ...dispatchKeys.availableDrivers(isAvailable),
      page,
      limit,
      search,
    ],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DriversApiResponse>>("/drivers", {
        params: { isAvailable, page, limit, search },
      });
      return res.data;
    },
    enabled: Boolean(isAuthenticated && (options?.enabled ?? true)),
    refetchInterval: 10000,
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
      queryClient.invalidateQueries({ queryKey: ["emergency"] });
      queryClient.invalidateQueries({ queryKey: ["fleet"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
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
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: dispatchKeys.all });

      const previousActive = queryClient.getQueryData<Dispatch>(
        dispatchKeys.activeDriver(),
      );
      const previousDetail = queryClient.getQueryData<Dispatch>(
        dispatchKeys.detail(id),
      );

      if (previousActive) {
        queryClient.setQueryData<Dispatch>(dispatchKeys.activeDriver(), {
          ...previousActive,
          status: input.status,
        });
      }
      if (previousDetail) {
        queryClient.setQueryData<Dispatch>(dispatchKeys.detail(id), {
          ...previousDetail,
          status: input.status,
        });
      }

      return { previousActive, previousDetail };
    },
    onError: (error, { id }, context) => {
      if (context?.previousActive) {
        queryClient.setQueryData(
          dispatchKeys.activeDriver(),
          context.previousActive,
        );
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          dispatchKeys.detail(id),
          context.previousDetail,
        );
      }
      toast.error(error.message || "Failed to update trip status.");
    },
    onSuccess: (data) => {
      toast.success(`Trip status updated to: ${data.status}`);
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
}
