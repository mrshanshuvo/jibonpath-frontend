"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation, Compass, ShieldAlert, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TelemetryTick } from "@/types/entities.types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface LiveTrackingMapProps {
  telemetry?: TelemetryTick | null;
  pickup?: { lat: number; lng: number; address?: string } | null;
  hospital?: { lat: number; lng: number; name?: string } | null;
  vehicleNumber?: string;
  stage?: string;
  className?: string;
  showOverlays?: boolean;
  sidebarOpen?: boolean;
}

export function LiveTrackingMap({
  telemetry,
  pickup,
  hospital,
  vehicleNumber = "AMB-EM-104",
  stage,
  className,
  showOverlays = true,
  sidebarOpen = true,
}: LiveTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const ambulanceMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const ambulanceIconRef = useRef<HTMLDivElement | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const hospitalMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initial Mapbox setup (1 Map Load per modal session = $0 extra cost)
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const initialCenter: [number, number] = [
        telemetry?.lng || pickup?.lng || 90.4125,
        telemetry?.lat || pickup?.lat || 23.8103,
      ];

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: initialCenter,
        zoom: 13,
        pitch: 35,
        antialias: true,
      });

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: true }),
        "top-right",
      );

      map.on("load", () => {
        mapRef.current = map;
        map.resize();
        setMapReady(true);
      });

      const handleResize = () => {
        map.resize();
      };
      window.addEventListener("resize", handleResize);

      map.on("error", (e) => {
        // If webgl or style fails, log error
        console.warn("Mapbox load notice:", e);
      });

      return () => {
        window.removeEventListener("resize", handleResize);
        map.remove();
        mapRef.current = null;
        ambulanceMarkerRef.current = null;
        pickupMarkerRef.current = null;
        hospitalMarkerRef.current = null;
      };
    } catch (err: unknown) {
      setMapError("Unable to initialize WebGL map canvas");
    }
  }, []);

  // Update or create Static Pins (Pickup and Hospital)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // 1. Pickup Pin
    if (pickup?.lat && pickup?.lng) {
      if (!pickupMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "pickup-marker-beacon";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute h-8 w-8 rounded-full bg-emergency/30 animate-ping"></span>
            <div class="h-8 w-8 rounded-full bg-emergency border-2 border-white shadow-xl flex items-center justify-center text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21a9 9 0 0 0 9-9c0-6-9-13-9-13S3 6 3 12a9 9 0 0 0 9 9Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </div>
        `;
        pickupMarkerRef.current = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([pickup.lng, pickup.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-1 font-sans"><div class="font-bold text-xs text-red-600">Patient Pickup</div><div class="text-[11px] text-gray-700">${pickup.address || "Emergency Scene"}</div></div>`,
            ),
          )
          .addTo(map);
      } else {
        pickupMarkerRef.current.setLngLat([pickup.lng, pickup.lat]);
      }
    }

    // 2. Hospital Pin
    if (hospital?.lat && hospital?.lng) {
      if (!hospitalMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "hospital-marker-beacon";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="h-8 w-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21v-8.25M6.75 21v-8.25M17.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5"/></svg>
            </div>
          </div>
        `;
        hospitalMarkerRef.current = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([hospital.lng, hospital.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-1 font-sans"><div class="font-bold text-xs text-emerald-600">Receiving Trauma Bay</div><div class="text-[11px] text-gray-700">${hospital.name || "Hospital Emergency Dept"}</div></div>`,
            ),
          )
          .addTo(map);
      } else {
        hospitalMarkerRef.current.setLngLat([hospital.lng, hospital.lat]);
      }
    }
  }, [mapReady, pickup, hospital]);

  // Fallback initial position so ambulance is immediately visible even before first SSE tick
  const effectiveTelemetry: TelemetryTick = useMemo(() => {
    if (telemetry) return telemetry;
    return {
      dispatchId: "",
      lat: pickup ? pickup.lat - 0.009 : 23.7516,
      lng: pickup ? pickup.lng - 0.007 : 90.3807,
      heading: 45,
      speedKmh: 42,
      stage: stage || "EN_ROUTE",
      updatedAt: new Date().toISOString(),
    };
  }, [telemetry, pickup, stage]);

  // Real-Time Vehicle Marker Repositioning (Pure WebGL - $0 Mapbox Cost)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const { lat, lng, heading = 0, speedKmh = 0 } = effectiveTelemetry;

    if (!ambulanceMarkerRef.current) {
      // Create pulsing ambulance marker
      const containerEl = document.createElement("div");
      containerEl.className = "ambulance-tracking-marker";
      containerEl.innerHTML = `
        <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
          <!-- Radar ping wave -->
          <div class="absolute inset-0 rounded-full bg-red-500/40 animate-ping"></div>
          <!-- Direction arrow ring -->
          <div class="ambulance-rotation-wrapper flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 border-2 border-red-500 shadow-2xl text-white transition-transform duration-700 ease-out" style="transform: rotate(${heading}deg);">
            <!-- Direction pointer -->
            <div class="absolute -top-1 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-[6px] border-b-red-400"></div>
            <!-- Ambulance icon -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10 17h4V5H2v12h3m11 0h2m-2-4h4.382a1 1 0 0 0 .894-.553l1.894-3.789A1 1 0 0 0 22 8.211V5h-6v8Z" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
        </div>
      `;

      ambulanceIconRef.current = containerEl.querySelector(
        ".ambulance-rotation-wrapper",
      );

      ambulanceMarkerRef.current = new mapboxgl.Marker({
        element: containerEl,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-1 font-sans"><div class="font-bold text-xs text-slate-900">${vehicleNumber}</div><div class="text-[11px] text-gray-600">Speed: ${speedKmh} km/h</div></div>`,
          ),
        )
        .addTo(map);

      // Auto frame all mission points cleanly
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([lng, lat]);
      if (pickup?.lng && pickup?.lat) bounds.extend([pickup.lng, pickup.lat]);
      if (hospital?.lng && hospital?.lat) bounds.extend([hospital.lng, hospital.lat]);
      if (!bounds.isEmpty()) {
        const isDesktop =
          typeof window !== "undefined" && window.innerWidth >= 640;
        map.fitBounds(bounds, {
          padding: {
            top: 70,
            bottom: 70,
            left: !showOverlays && isDesktop && sidebarOpen ? 460 : 70,
            right: 70,
          },
          maxZoom: 15,
          duration: 1000,
        });
      }
    } else {
      // Smoothly update location on existing marker (pure client WebGL translation)
      ambulanceMarkerRef.current.setLngLat([lng, lat]);

      // Rotate heading orientation smoothly
      if (ambulanceIconRef.current) {
        ambulanceIconRef.current.style.transform = `rotate(${heading}deg)`;
      }
    }
  }, [mapReady, effectiveTelemetry, vehicleNumber, pickup, hospital]);

  // Draw GeoJSON transit route line (segmented by mission stage)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const coords: [number, number][] = [];
    const ambPoint: [number, number] = [effectiveTelemetry.lng, effectiveTelemetry.lat];
    const pickupPoint: [number, number] | null =
      pickup?.lng && pickup?.lat ? [pickup.lng, pickup.lat] : null;
    const hospitalPoint: [number, number] | null =
      hospital?.lng && hospital?.lat ? [hospital.lng, hospital.lat] : null;

    if (
      stage === "HOSPITAL_SELECTED" ||
      stage === "HOSPITAL_ARRIVAL" ||
      stage === "COMPLETED"
    ) {
      coords.push(ambPoint);
      if (hospitalPoint) coords.push(hospitalPoint);
    } else {
      coords.push(ambPoint);
      if (pickupPoint) coords.push(pickupPoint);
      if (hospitalPoint) coords.push(hospitalPoint);
    }

    if (coords.length >= 2) {
      const sourceId = "live-transit-route";
      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      };

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#EF4444",
            "line-width": 4,
            "line-dasharray": [2, 2],
            "line-opacity": 0.85,
          },
        });
      }
    }
  }, [mapReady, effectiveTelemetry, pickup, hospital, stage]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;
    mapRef.current.flyTo({
      center: [effectiveTelemetry.lng, effectiveTelemetry.lat],
      zoom: 14.5,
      essential: true,
      offset: !showOverlays && isDesktop && sidebarOpen ? [140, 0] : [0, 0],
    });
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-surface",
        className
          ? className
          : "h-105 sm:h-120 rounded-2xl border border-border shadow-2xl",
      )}
    >
      <div ref={mapContainer} className="w-full h-full" />

      {mapError && (
        <div className="absolute inset-0 bg-surface/90 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="h-10 w-10 text-emergency mb-2" />
          <h4 className="text-sm font-bold text-foreground">
            Live Telemetry Radar View
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Ambulance is actively streaming coordinates to the central dispatch
            hub.
          </p>
        </div>
      )}

      {/* Floating HUD Badges Overlay (Shown only when not embedded in full cockpit) */}
      {showOverlays && (
        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emergency" />
            </span>
            <span className="text-xs font-bold text-foreground tracking-wide uppercase font-mono">
              {stage || "EN ROUTE"}
            </span>
          </div>

          {telemetry && (
            <div className="bg-card/90 backdrop-blur-md px-3 py-2 rounded-xl border border-border shadow-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground font-mono">
                <Navigation className="h-3.5 w-3.5 text-info animate-pulse" />
                <span>{telemetry.speedKmh || 38} km/h</span>
                <span className="text-muted-foreground text-[10px]">·</span>
                <span className="text-muted-foreground text-[10px]">
                  Heading {telemetry.heading || 0}°
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {telemetry.lat.toFixed(4)}° N, {telemetry.lng.toFixed(4)}° E
              </div>
            </div>
          )}
        </div>
      )}

      {/* Re-center Action Button */}
      {telemetry && (
        <button
          type="button"
          onClick={handleRecenter}
          className={cn(
            "absolute bg-card/90 hover:bg-card border border-border text-foreground hover:text-primary text-xs font-semibold px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md z-20",
            showOverlays
              ? "bottom-3 left-3"
              : sidebarOpen
                ? "bottom-4 left-4 sm:left-109"
                : "bottom-4 left-4",
          )}
        >
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span>Follow Ambulance</span>
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-lg text-[11px] font-medium">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emergency" />
          <span className="text-foreground">Ambulance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-foreground">Hospital</span>
        </div>
      </div>
    </div>
  );
}
