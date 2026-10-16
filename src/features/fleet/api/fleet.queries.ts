"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api.types";
import type { Ambulance } from "@/types/entities.types";
import type {
  CreateAmbulanceInput,
  FleetApiResponse,
  FleetQueryParams,
  UpdateAmbulanceInput,
} from "../types";

export const fleetKeys = {
  all: ["fleet"] as const,
  list: (params?: FleetQueryParams) =>
    [...fleetKeys.all, "list", params] as const,
  detail: (id: string) => [...fleetKeys.all, "detail", id] as const,
};

/**
 * useAmbulances:
 * Fetches paginated ambulance fleet vehicles with status/type filters
 */
export function useAmbulances(
  params?: FleetQueryParams,
  options?: { enabled?: boolean },
) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.status && params.status !== "ALL")
    queryParams.status = params.status;
  if (params?.type && params.type !== "ALL") queryParams.type = params.type;
  if (params?.search) queryParams.search = params.search;

  return useQuery({
    queryKey: fleetKeys.list(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<FleetApiResponse>>("/ambulances", {
        params: queryParams,
      });
      return res.data;
    },
    enabled: Boolean(isAuthenticated && (options?.enabled ?? true)),
    refetchInterval: 10000,
  });
}

/**
 * useAmbulance:
 * Fetches single ambulance vehicle details
 */
export function useAmbulance(id?: string) {
  return useQuery({
    queryKey: fleetKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Ambulance ID is required");
      const res = await api.get<ApiResponse<Ambulance>>(`/ambulances/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

/**
 * useCreateAmbulance:
 * Administrator registers a new emergency response vehicle into rotation
 */
export function useCreateAmbulance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAmbulanceInput): Promise<Ambulance> => {
      const res = await api.post<ApiResponse<Ambulance>>(
        "/ambulances",
        payload,
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      toast.success(`Vehicle ${data.vehicleNumber} added to fleet rotation!`);
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to register new ambulance.");
    },
  });
}

/**
 * useUpdateAmbulance:
 * Updates vehicle status or specification
 */
export function useUpdateAmbulance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateAmbulanceInput;
    }): Promise<Ambulance> => {
      const res = await api.patch<ApiResponse<Ambulance>>(
        `/ambulances/${id}`,
        input,
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      toast.success(`Vehicle ${data.vehicleNumber} updated successfully.`);
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update vehicle details.");
    },
  });
}

/**
 * useDeleteAmbulance:
 * Removes an ambulance from fleet rotation
 */
export function useDeleteAmbulance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/ambulances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all });
      toast.info("Vehicle removed from fleet rotation.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove vehicle.");
    },
  });
}
