import { ApiError, type ApiResponse, type ApiErrorResponse } from "@/types/api.types";
import { useAuthStore } from "@/stores/auth.store";

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
 * Refreshes access token via server route handler /api/auth/session
 * which holds the HTTP-only refresh token cookie.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
      });

      if (!res.ok) {
        useAuthStore.getState().clearAuth();
        return null;
      }

      const json = (await res.json()) as { success: boolean; accessToken?: string };
      if (json.success && json.accessToken) {
        useAuthStore.getState().setAccessToken(json.accessToken);
        return json.accessToken;
      }

      useAuthStore.getState().clearAuth();
      return null;
    } catch {
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const { params, skipAuth, headers: customHeaders, ...fetchOptions } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

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
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
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

    // 401 Unauthorized handling with token refresh retry
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

    if (!response.ok) {
      const errorJson = responseData as ApiErrorResponse | null;
      const message = errorJson?.message || `Request failed with status ${response.status}`;
      const errors = errorJson?.errors;
      throw new ApiError(message, response.status, errors);
    }

    const successJson = responseData as ApiResponse<T>;
    // If backend returns the standard ApiResponse wrapper, unpack data
    if (
      successJson &&
      typeof successJson === "object" &&
      "success" in successJson &&
      "data" in successJson
    ) {
      return successJson.data;
    }

    return responseData as T;
  } catch (error) {
    // Law 5: Log errors in development — never in production
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
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
