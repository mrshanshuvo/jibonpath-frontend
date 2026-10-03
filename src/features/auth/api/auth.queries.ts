"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_DEFAULT_REDIRECT } from "@/config/roles";
import { ROUTES } from "@/config/routes";
import type { ApiResponse } from "@/types/api.types";
import type { User } from "@/types/entities.types";
import type {
  LoginPayload,
  RegisterPayload,
  AuthSessionResponse,
} from "../types";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/**
 * useLogin mutation:
 * 1. Authenticates against Express backend /auth/login
 * 2. Establishes server-set HTTP-only cookie via /api/auth/session route handler
 * 3. Populates in-memory Zustand store (no localStorage token leakage)
 * 4. Redirects to target URL (searchParams redirect) or role-based default dashboard
 */
export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      credentials: LoginPayload,
    ): Promise<AuthSessionResponse> => {
      // Step 1: Call Express backend login
      const response = await api.post<ApiResponse<AuthSessionResponse>>(
        "/auth/login",
        credentials,
        { skipAuth: true },
      );

      const { user, accessToken, refreshToken } = response.data;

      // Step 2: Establish HTTP-only session cookie
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken, role: user.role }),
      });

      // Step 3: Populate in-memory Zustand store
      useAuthStore.getState().setAuth(user, accessToken);

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
      toast.success(`Welcome back, ${data.user.name}!`);

      // Determine redirect path
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.replace(redirectUrl);
      } else {
        router.replace(ROLE_DEFAULT_REDIRECT[data.user.role]);
      }
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to sign in. Please verify your credentials.",
      );
    },
  });
}

/**
 * useRegister mutation:
 * 1. Creates new patient account in Express backend
 * 2. Establishes server HTTP-only cookie
 * 3. Populates in-memory Zustand store
 * 4. Redirects to patient dashboard
 */
export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: RegisterPayload,
    ): Promise<AuthSessionResponse> => {
      const response = await api.post<ApiResponse<AuthSessionResponse>>(
        "/auth/register",
        payload,
        { skipAuth: true },
      );

      const { user, accessToken, refreshToken } = response.data;

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken, role: user.role }),
      });

      useAuthStore.getState().setAuth(user, accessToken);

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user);
      toast.success("Account created successfully! Welcome to PulsePoint.");
      router.replace(ROLE_DEFAULT_REDIRECT[data.user.role]);
    },
    onError: (error) => {
      toast.error(
        error.message || "Registration failed. Please check the inputs.",
      );
    },
  });
}

/**
 * useLogout mutation:
 * 1. Cleans server HTTP-only session cookie
 * 2. Resets Zustand runtime state
 * 3. Clears TanStack Query cache
 * 4. Redirects to login
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api.post("/auth/logout");
      } catch {
        // Express logout is best-effort (JWT is stateless)
      }

      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });

      useAuthStore.getState().clearAuth();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.info("Logged out successfully");
      router.replace(ROUTES.AUTH.LOGIN);
    },
  });
}

/**
 * useMe query:
 * Fetches current authenticated user profile
 */
export function useMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>("/users/me");
      if (response.data) {
        useAuthStore.getState().updateUser(response.data);
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
