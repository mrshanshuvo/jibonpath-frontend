import { z } from "zod";
import {
  Priority,
  RequestStatus,
  type EmergencyRequest,
} from "@/types/entities.types";

export const createEmergencyRequestSchema = z.object({
  priority: z.nativeEnum(Priority, {
    errorMap: () => ({ message: "Please select an emergency severity level" }),
  }),
  pickupAddress: z
    .string()
    .min(5, "Pickup address must be at least 5 characters"),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  description: z.string().optional(),
  hospitalName: z.string().optional(),
});

export type CreateEmergencyRequestInput = z.infer<
  typeof createEmergencyRequestSchema
>;

export interface RequestQueryParams {
  page?: number;
  limit?: number;
  status?: RequestStatus | "ALL";
  priority?: Priority | "ALL";
}

export interface RequestsApiResponse {
  requests: EmergencyRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
