import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Role, type User } from "@/types/entities.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Helpers to sync lightweight cookies for Next.js proxy/edge checks
function setSessionCookies(token: string, role: Role) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `auth_role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearSessionCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "auth_role=; path=/; max-age=0; SameSite=Lax";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: User, accessToken: string, refreshToken?: string) => {
        setSessionCookies(accessToken, user.role);
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updated = { ...currentUser, ...updates };
        if (updates.role) {
          setSessionCookies(get().accessToken || "", updates.role);
        }
        set({ user: updated });
      },

      setAccessToken: (accessToken: string) => {
        const user = get().user;
        if (user) {
          setSessionCookies(accessToken, user.role);
        }
        set({ accessToken });
      },

      clearAuth: () => {
        clearSessionCookies();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: "ambulance_auth_state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Strict selector hooks for performance optimization (never use store directly in heavy components)
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useAuthAccessToken = () => useAuthStore((state) => state.accessToken);
