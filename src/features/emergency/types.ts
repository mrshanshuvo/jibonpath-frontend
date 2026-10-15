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
    .trim()
    .min(1, "Pickup address is required")
    .min(5, "Pickup address must be at least 5 characters"),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  contactPhone: z
    .string()
    .trim()
    .min(1, "Callback phone number is required")
    .regex(
      /^(?:\+?880\s?|0)1[3-9]\d{8}$|^[+\d][\d\s\-()]{7,16}$/,
      "Enter a valid phone number (e.g. 017XXXXXXXX or +8801XXXXXXXXX)",
    ),
  description: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional(),
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
