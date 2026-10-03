import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

// Helpers to sync session cookies for Next.js proxy/edge RBAC verification
function setSessionCookies(token: string, role: Role) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
  document.cookie = `auth_role=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
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
      accessToken: null, // Strictly in-memory as mandated by STANDARDS.md Section 10
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: User, accessToken: string) => {
        setSessionCookies(accessToken, user.role);
        set({
          user,
          accessToken, // In-memory only
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updated = { ...currentUser, ...updates };
        if (updates.role && get().accessToken) {
          setSessionCookies(get().accessToken!, updates.role);
        }
        set({ user: updated });
      },

      setAccessToken: (accessToken: string) => {
        const user = get().user;
        if (user) {
          setSessionCookies(accessToken, user.role);
        }
        set({ accessToken, isAuthenticated: true });
      },

      clearAuth: () => {
        clearSessionCookies();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: "ambulance_auth_session",
      storage: createJSONStorage(() => localStorage),
      // Lawful partialize: NEVER store accessToken or refreshToken in localStorage (XSS Vulnerable)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Strict selector hooks for performance optimization (never use root store in heavy components)
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useAuthAccessToken = () => useAuthStore((state) => state.accessToken);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
