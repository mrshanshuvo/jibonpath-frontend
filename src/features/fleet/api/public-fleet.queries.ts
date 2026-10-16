"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api.types";
import type { Ambulance } from "@/types/entities.types";

export interface PublicFleetResponse {
  ambulances: Ambulance[];
  meta: { total: number };
}

export function usePublicAmbulances() {
  return useQuery({
    queryKey: ["public-fleet"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PublicFleetResponse>>(
        "/ambulances",
        {
          params: { limit: 50 },
          skipAuth: true,
        },
      );
      return res.data;
    },
    refetchInterval: 15000,
  });
}
