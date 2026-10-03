"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useLogin, useRegister, useLogout, useMe } from "../api/auth.queries";

/**
 * useAuth:
 * Central auth hook exposing store state, user role, and action mutations
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const meQuery = useMe();

  return {
    user,
    role: user?.role ?? null,
    accessToken,
    isAuthenticated,
    isLoading: isLoading || meQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    refetchMe: meQuery.refetch,
  };
}
