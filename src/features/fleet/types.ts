import { z } from "zod";
import {
  AmbulanceStatus,
  AmbulanceType,
  type Ambulance,
} from "@/types/entities.types";

export const createAmbulanceSchema = z.object({
  registrationNumber: z
    .string()
    .min(3, "Registration number must be at least 3 characters"),
  model: z.string().min(2, "Vehicle model is required"),
  type: z.nativeEnum(AmbulanceType, {
    errorMap: () => ({ message: "Select a valid ambulance equipment tier" }),
  }),
  status: z.nativeEnum(AmbulanceStatus).optional().default(AmbulanceStatus.AVAILABLE),
});

export type CreateAmbulanceInput = z.infer<typeof createAmbulanceSchema>;

export const updateAmbulanceSchema = z.object({
  registrationNumber: z.string().min(3).optional(),
  model: z.string().min(2).optional(),
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
