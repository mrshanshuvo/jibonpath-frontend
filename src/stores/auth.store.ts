import { create } from "zustand";
import { Role, type User } from "@/types/entities.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Pure in-memory Zustand store matching STANDARDS.md Section 6 & 10.
 * NEVER stores accessToken or refreshToken in localStorage (XSS prevention).
 * Tokens are held strictly in runtime memory.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Start loading until initial session check finishes

  setAuth: (user: User, accessToken: string) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    }),

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    set({ user: { ...currentUser, ...updates } });
  },

  setAccessToken: (accessToken: string) =>
    set({ accessToken, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

// Strict selector hooks for performance optimization (never use store directly in heavy components)
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useAuthAccessToken = () => useAuthStore((state) => state.accessToken);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
