import { z } from "zod";
import { Role, type User, type AuditLog } from "@/types/entities.types";

export interface AdminStats {
  users: {
    total: number;
    drivers: number;
  };
  ambulances: {
    total: number;
    available: number;
    dispatched: number;
    maintenance: number;
  };
  requests: {
    total: number;
    pending: number;
    completed: number;
  };
  payments: {
    totalRevenue: number;
    currency: string;
  };
}

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  role?: Role | "ALL";
  search?: string;
}

export interface AdminUsersApiResponse {
  data: User[];
  users: User[];
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

export interface AdminAuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  search?: string;
}

export interface AdminAuditLogsApiResponse {
  data: AuditLog[];
  logs: AuditLog[];
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

export const createDriverSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  licenseNumber: z
    .string()
    .min(5, "Valid BRTA driver license number is required"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^(?:\+?880\s?|0)1[3-9]\d{8}$|^[+\d][\d\s\-()]{7,16}$/.test(val),
      "Enter a valid phone number (e.g. 017XXXXXXXX or +8801XXXXXXXXX)",
    ),
  ambulanceId: z.string().optional(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
