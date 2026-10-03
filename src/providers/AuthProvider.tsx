"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Attempt session rehydration on initial application mount
    let isMounted = true;

    async function rehydrateSession() {
      try {
        const res = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok && isMounted) {
          const data = (await res.json()) as {
            success: boolean;
            accessToken?: string;
          };

          if (data.success && data.accessToken) {
            useAuthStore.getState().setAccessToken(data.accessToken);
          }
        }
      } catch {
        // If unauthenticated or network error, session remains null
      } finally {
        if (isMounted) {
          useAuthStore.getState().setLoading(false);
        }
      }
    }

    rehydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return <>{children}</>;
}
