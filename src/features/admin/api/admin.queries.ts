"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types/api.types";
import type { User, Role } from "@/types/entities.types";
import type {
  AdminAuditLogsApiResponse,
  AdminAuditLogsQueryParams,
  AdminStats,
  AdminUsersApiResponse,
  AdminUsersQueryParams,
  CreateDriverInput,
} from "../types";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (params?: AdminUsersQueryParams) =>
    [...adminKeys.all, "users", params] as const,
  auditLogs: (params?: AdminAuditLogsQueryParams) =>
    [...adminKeys.all, "auditLogs", params] as const,
};

/**
 * useAdminStats:
 * Fetches dashboard summary statistics (cached in Redis, live poll every 10s)
 */
export function useAdminStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminStats>>("/admin/stats");
      return res.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });
}

/**
 * useAdminUsers:
 * Fetches paginated user directory with search and role filters
 */
export function useAdminUsers(params?: AdminUsersQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.role && params.role !== "ALL") queryParams.role = params.role;
  if (params?.search) queryParams.search = params.search;

  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminUsersApiResponse>>(
        "/admin/users",
        {
          params: queryParams,
        },
      );
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

/**
 * useUpdateUserRole:
 * Changes a user's authorization role (PATIENT, DRIVER, ADMIN)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: string;
      role: Role;
    }): Promise<User> => {
      const res = await api.patch<ApiResponse<User>>(
        `/admin/users/${id}/role`,
        {
          role,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success(`User ${data.name} role changed to ${data.role}`);
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role.");
    },
  });
}

/**
 * useToggleUserStatus:
 * Activates or suspends a user's account
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }): Promise<User> => {
      const res = await api.patch<ApiResponse<User>>(
        `/admin/users/${id}/status`,
        {
          isActive,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.success(
        `User ${data.name} ${data.isActive ? "activated" : "deactivated"} successfully.`,
      );
      return data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change user account status.");
    },
  });
}

/**
 * useDeleteUser:
 * Soft deletes user account
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      toast.info("User account deleted successfully.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user account.");
    },
  });
}

/**
 * useCreateDriver:
 * Directly creates and commissions a paramedic driver with license
 */
export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDriverInput) => {
      const res = await api.post<ApiResponse<unknown>>("/admin/drivers", input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(
        "Paramedic driver commissioned and onboarded successfully!",
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create driver account.");
    },
  });
}

/**
 * useAuditLogs:
 * Fetches paginated system audit trail
 */
export function useAuditLogs(params?: AdminAuditLogsQueryParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.action) queryParams.action = params.action;
  if (params?.entityType) queryParams.entityType = params.entityType;

  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminAuditLogsApiResponse>>(
        "/admin/audit-logs",
        { params: queryParams },
      );
      return res.data;
    },
    enabled: isAuthenticated,
  });
}
