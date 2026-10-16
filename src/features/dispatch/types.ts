import { z } from "zod";
import { DispatchStatus, type Dispatch, type TelemetryTick } from "@/types/entities.types";

export type { TelemetryTick };

export const updateDispatchStatusSchema = z.object({
  status: z.nativeEnum(DispatchStatus, {
    errorMap: () => ({ message: "Invalid dispatch status" }),
  }),
  note: z.string().optional(),
});

export type UpdateDispatchStatusInput = z.infer<
  typeof updateDispatchStatusSchema
>;

export const createDispatchSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  ambulanceId: z.string().min(1, "Ambulance ID is required"),
  driverId: z.string().min(1, "Driver ID is required"),
});

export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;

export interface DispatchQueryParams {
  page?: number;
  limit?: number;
  status?: DispatchStatus | "ALL";
  search?: string;
}

export interface DispatchesApiResponse {
  data: Dispatch[];
  dispatches: Dispatch[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  links?: import("@/types/api.types").PaginationLinks;
}

export interface DriversApiResponse {
  data: import("@/types/entities.types").Driver[];
  drivers: import("@/types/entities.types").Driver[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  links?: import("@/types/api.types").PaginationLinks;
}
