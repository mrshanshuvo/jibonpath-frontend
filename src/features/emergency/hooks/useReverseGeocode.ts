"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";

export interface ReverseGeocodeResult {
  address: string;
  area?: string;
}

interface Coords {
  lat: number;
  lng: number;
}

/**
 * Reverse geocodes a lat/lng pair into a human-readable address.
 * Falls back to a coordinate string if the lookup fails, so pickup
 * is never blocked by a network error.
 *
 * Calls a Next.js route handler at /api/geocode/reverse which holds
 * the third-party geocoding API key server-side.
 *
 * Compliant with STANDARDS.md §11: uses the centralized api client,
 * never raw fetch.
 */
export function useReverseGeocode() {
  const [isResolving, setIsResolving] = useState(false);

  async function resolve(coords: Coords): Promise<ReverseGeocodeResult> {
    setIsResolving(true);
    try {
      const result = await api.get<ReverseGeocodeResult>(
        "/api/geocode/reverse",
        { params: { lat: coords.lat, lng: coords.lng }, skipAuth: true },
      );
      if (!result?.address) throw new Error("Empty geocode response");
      return result;
    } catch {
      return {
        address: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      };
    } finally {
      setIsResolving(false);
    }
  }

  return { resolve, isResolving };
}
