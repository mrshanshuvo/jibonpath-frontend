"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface UrlParamOptions {
  replace?: boolean;
}

/**
 * Hook for URL state syncing as mandated by STANDARDS.md Section 15
 * Keeps all filterable and paginated state synchronized with search params.
 * Defaults to router.replace to avoid cluttering browser history during filtering.
 */
export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => {
    return new URLSearchParams(searchParams?.toString() ?? "");
  }, [searchParams]);

  const setParam = useCallback(
    (
      key: string,
      value: string | number | null | undefined,
      options: UrlParamOptions = { replace: true },
    ) => {
      const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
      if (value === null || value === undefined || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
      const query = nextParams.toString();
      const target = query ? `${pathname}?${query}` : pathname;

      if (options.replace) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [searchParams, pathname, router],
  );

  const setParams = useCallback(
    (
      updates: Record<string, string | number | null | undefined>,
      options: UrlParamOptions = { replace: true },
    ) => {
      const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, String(value));
        }
      });
      const query = nextParams.toString();
      const target = query ? `${pathname}?${query}` : pathname;

      if (options.replace) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [searchParams, pathname, router],
  );

  const removeParam = useCallback(
    (key: string, options: UrlParamOptions = { replace: true }) => {
      const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
      nextParams.delete(key);
      const query = nextParams.toString();
      const target = query ? `${pathname}?${query}` : pathname;

      if (options.replace) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [searchParams, pathname, router],
  );

  return {
    params,
    setParam,
    setParams,
    removeParam,
  };
}
