import { ApiError, type ApiResponse, type ApiErrorResponse } from "@/types/api.types";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/routes";
import { getAllowedRolesForPath } from "@/config/roles";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ambulance-dispatch-backend-66f2.onrender.com/api/v1";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Cleanly handles logout per STANDARDS.md Section 11 Law 2:
 * 1. Clears in-memory client state
 * 2. Clears server-set HTTP-only cookies via DELETE /api/auth/session
 * 3. Redirects to login with preserved return path ONLY if on a protected route
 */
async function handleLogout(): Promise<void> {
  useAuthStore.getState().clearAuth();

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Ignore network errors during session cleanup
    }

    const currentPath = window.location.pathname;
    const fullPath = window.location.pathname + window.location.search;
    const isProtected = getAllowedRolesForPath(currentPath) !== null;

    // Only force redirect if currently browsing a protected dashboard route
    if (isProtected) {
      window.location.href = `${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(fullPath)}`;
    }
  }
}

/**
 * Refreshes access token via server route handler /api/auth/session
 * which safely holds the HTTP-only refresh token cookie.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const endpoint =
        typeof window !== "undefined"
          ? "/api/auth/session"
          : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/session`;

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        await handleLogout();
        return null;
      }

      const json = (await res.json()) as {
        success: boolean;
        accessToken?: string;
      };
      if (json.success && json.accessToken) {
        useAuthStore.getState().setAccessToken(json.accessToken);
        return json.accessToken;
      }

      await handleLogout();
      return null;
    } catch {
      await handleLogout();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Centralized request dispatcher satisfying all 5 responsibilities in STANDARDS.md Section 11:
 * 1. Injects Bearer token from Zustand store automatically
 * 2. Handles 401 Unauthorized — attempts token refresh once, retries request, then logs out
 * 3. Parses errors consistently into ApiError shape: { message, status, errors }
 * 4. Never throws raw Response objects — always throws typed ApiError
 * 5. Logs errors in development — never in production
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { params, skipAuth, headers: customHeaders, ...fetchOptions } = options;

  let url: string;
  if (endpoint.startsWith("http")) {
    url = endpoint;
  } else if (endpoint.startsWith("/api/")) {
    // Next.js local internal route handler
    url = endpoint;
  } else {
    // Backend API endpoint
    url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  }

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const headers = new Headers(customHeaders);

  // Set Content-Type only if request has a payload and isn't FormData
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (!skipAuth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Responsibility 2: 401 Unauthorized handling with single refresh retry
    if (response.status === 401 && !skipAuth && !isRetry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request<T>(endpoint, options, true);
      }
      throw new ApiError("Session expired. Please log in again.", 401);
    }

    let responseData: unknown = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Responsibility 3 & 4: Parse errors consistently into ApiError
    if (!response.ok) {
      const errorJson = responseData as ApiErrorResponse | null;
      const message =
        errorJson?.message ||
        (typeof responseData === "string" && responseData
          ? responseData
          : `Request failed with status ${response.status}`);
      const errors = errorJson?.errors;
      throw new ApiError(message, response.status, errors);
    }

    // Return the response data preserving caller's specified contract type T
    return responseData as T;
  } catch (error) {
    // Responsibility 5: Log errors in development — never in production
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${options.method || "GET"} ${url}:`, error);
    }

    if (error instanceof ApiError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "An unexpected network error occurred";
    throw new ApiError(message, 500);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
