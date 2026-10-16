"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api-client";
import { DispatchStatus } from "@/types/entities.types";

interface UseDriverLocationBroadcastProps {
  dispatchId?: string;
  isActive: boolean;
  stage?: DispatchStatus;
  pickupCoords?: { lat: number; lng: number } | null;
  hospitalCoords?: { lat: number; lng: number } | null;
}

interface LocationState {
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
}

// Calculate bearing between two coordinates in degrees (0 - 360)
function calculateBearing(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
): number {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) *
      Math.cos(destLatRad) *
      Math.cos(destLngRad - startLngRad);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;
  return Math.round(brng);
}

export function useDriverLocationBroadcast({
  dispatchId,
  isActive,
  stage = DispatchStatus.EN_ROUTE,
  pickupCoords,
  hospitalCoords,
}: UseDriverLocationBroadcastProps) {
  // Default base station in central Dhaka (Farmgate / Panthapath area)
  const baseLat = 23.7516;
  const baseLng = 90.3807;

  const destPickup = useMemo(
    () => pickupCoords || { lat: 23.758, lng: 90.39 },
    [pickupCoords],
  );
  const destHospital = useMemo(
    () => hospitalCoords || { lat: 23.7258, lng: 90.3976 },
    [hospitalCoords],
  );

  const [coords, setCoords] = useState<LocationState>({
    lat: baseLat,
    lng: baseLng,
    heading: 45,
    speedKmh: 0,
  });

  const [hasBroadcasted, setHasBroadcasted] = useState(false);
  const [isSimulated, setIsSimulated] = useState(
    () => typeof window === "undefined" || !("geolocation" in navigator),
  );
  const [error, setError] = useState<string | null>(null);

  const prevCoordsRef = useRef<LocationState | null>(null);
  const simulationStepRef = useRef(0);

  const isBroadcasting = Boolean(
    dispatchId &&
    isActive &&
    stage !== DispatchStatus.COMPLETED &&
    hasBroadcasted,
  );

  // Send coordinates to the backend telemetry store
  const sendLocationTick = useCallback(
    async (location: LocationState) => {
      if (!dispatchId || !isActive) return;
      try {
        await api.post(`/dispatches/${dispatchId}/location`, {
          lat: Number(location.lat.toFixed(6)),
          lng: Number(location.lng.toFixed(6)),
          heading: location.heading,
          speedKmh: location.speedKmh,
          stage,
        });
        setHasBroadcasted(true);
        setError(null);
      } catch (err: unknown) {
        // Log telemetry error quietly to avoid blocking driver UI
        const msg =
          err instanceof Error ? err.message : "Failed to broadcast coordinate";
        setError(msg);
      }
    },
    [dispatchId, isActive, stage],
  );

  useEffect(() => {
    if (!dispatchId || !isActive || stage === DispatchStatus.COMPLETED) {
      return;
    }

    let watchId: number | null = null;
    let fallbackTimer: NodeJS.Timeout | null = null;

    // Simulation route progression generator
    const runSimulationStep = () => {
      simulationStepRef.current += 1;
      const step = simulationStepRef.current;

      let targetStart = { lat: baseLat, lng: baseLng };
      let targetEnd = destPickup;

      if (
        stage === DispatchStatus.HOSPITAL_SELECTED ||
        stage === DispatchStatus.HOSPITAL_ARRIVAL
      ) {
        targetStart = destPickup;
        targetEnd = destHospital;
      } else if (stage === DispatchStatus.PATIENT_PICKUP) {
        // Stationary at patient pickup
        const loc: LocationState = {
          lat: destPickup.lat,
          lng: destPickup.lng,
          heading: coords.heading,
          speedKmh: 0,
        };
        setCoords(loc);
        sendLocationTick(loc);
        return;
      }

      // Smooth interpolation with cycling
      const progress = (step % 40) / 40;
      const curLat =
        targetStart.lat + (targetEnd.lat - targetStart.lat) * progress;
      const curLng =
        targetStart.lng + (targetEnd.lng - targetStart.lng) * progress;

      const bearing = calculateBearing(
        targetStart.lat,
        targetStart.lng,
        targetEnd.lat,
        targetEnd.lng,
      );

      const speed = Math.floor(35 + Math.random() * 12); // 35 - 47 km/h

      const nextLoc: LocationState = {
        lat: curLat,
        lng: curLng,
        heading: bearing,
        speedKmh: speed,
      };

      setCoords(nextLoc);
      sendLocationTick(nextLoc);
    };

    // Attempt real browser GPS first
    if ("geolocation" in navigator && !isSimulated) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading, speed } = position.coords;
          let calculatedHeading = heading || 0;

          if (prevCoordsRef.current && (!heading || Number.isNaN(heading))) {
            calculatedHeading = calculateBearing(
              prevCoordsRef.current.lat,
              prevCoordsRef.current.lng,
              latitude,
              longitude,
            );
          }

          const speedKmh = speed != null ? Math.round(speed * 3.6) : 38;

          const updated: LocationState = {
            lat: latitude,
            lng: longitude,
            heading: calculatedHeading,
            speedKmh,
          };

          prevCoordsRef.current = updated;
          setCoords(updated);
          sendLocationTick(updated);
        },
        () => {
          // Geolocation error or permission denied -> activate realistic Dhaka simulation
          setIsSimulated(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 1000,
        },
      );
    } else if (!isSimulated) {
      queueMicrotask(() => setIsSimulated(true));
    }

    // If in simulation mode, broadcast every 3 seconds
    if (isSimulated) {
      runSimulationStep(); // Immediate initial step
      fallbackTimer = setInterval(runSimulationStep, 3000);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [
    dispatchId,
    isActive,
    stage,
    isSimulated,
    sendLocationTick,
    baseLat,
    baseLng,
    destPickup,
    destHospital,
    coords.heading,
  ]);

  return {
    coords,
    isBroadcasting,
    isSimulated,
    toggleSimulated: () => setIsSimulated((prev) => !prev),
    error,
  };
}
