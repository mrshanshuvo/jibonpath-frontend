import { z } from "zod";
import {
  AmbulanceStatus,
  AmbulanceType,
  type Ambulance,
} from "@/types/entities.types";

export const createAmbulanceSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, "Vehicle number is required"),
  make: z.string().optional(),
  type: z.nativeEnum(AmbulanceType, {
    errorMap: () => ({ message: "Select a valid ambulance equipment tier" }),
  }),
  status: z.nativeEnum(AmbulanceStatus),
});

export type CreateAmbulanceInput = z.infer<typeof createAmbulanceSchema>;

export const updateAmbulanceSchema = z.object({
  vehicleNumber: z.string().optional(),
  make: z.string().optional(),
  type: z.nativeEnum(AmbulanceType).optional(),
  status: z.nativeEnum(AmbulanceStatus).optional(),
});

export type UpdateAmbulanceInput = z.infer<typeof updateAmbulanceSchema>;

export interface FleetQueryParams {
  page?: number;
  limit?: number;
  status?: AmbulanceStatus | "ALL";
  type?: AmbulanceType | "ALL";
}

export interface FleetApiResponse {
  ambulances: Ambulance[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
