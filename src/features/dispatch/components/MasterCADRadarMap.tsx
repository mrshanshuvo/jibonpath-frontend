"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Crosshair, ShieldAlert, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DispatchStatus, Priority } from "@/types/entities.types";
import type { Dispatch, TelemetryTick } from "@/types/entities.types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface MasterCADRadarMapProps {
  dispatches: Dispatch[];
  telemetryFeed?: Map<string, TelemetryTick>;
  selectedDispatchId?: string | null;
  onSelectDispatch: (dispatchId: string | null) => void;
  className?: string;
}

// Major Dhaka Emergency Hospitals with authoritative coordinates
const DHAKA_HOSPITAL_HUBS = [
  {
    id: "dmch",
    name: "Dhaka Medical College Hospital",
    shortName: "DMCH",
    lat: 23.7258,
    lng: 90.3976,
    address: "Secretariat Rd, Dhaka",
    traumaLevel: "Level 1 Trauma Center",
  },
  {
    id: "suhrawardy",
    name: "Shaheed Suhrawardy Medical College",
    shortName: "Suhrawardy",
    lat: 23.7699,
    lng: 90.3715,
    address: "Sher-e-Bangla Nagar, Dhaka",
    traumaLevel: "Emergency Trauma & Burn",
  },
  {
    id: "square",
    name: "Square Hospital",
    shortName: "Square",
    lat: 23.7533,
    lng: 90.3819,
    address: "Panthapath, Dhaka",
    traumaLevel: "Tertiary Trauma Care",
  },
  {
    id: "evercare",
    name: "Evercare Hospital Dhaka",
    shortName: "Evercare",
    lat: 23.8105,
    lng: 90.4312,
    address: "Bashundhara R/A, Dhaka",
    traumaLevel: "Super Specialty & ICU",
  },
  {
    id: "kurmitola",
    name: "Kurmitola General Hospital",
    shortName: "Kurmitola",
    lat: 23.8223,
    lng: 90.4074,
    address: "Airport Rd, Dhaka Cantonment",
    traumaLevel: "Emergency Trauma Unit",
  },
  {
    id: "nhf",
    name: "National Heart Foundation",
    shortName: "Heart Foundation",
    lat: 23.8041,
    lng: 90.3625,
    address: "Mirpur-2, Dhaka",
    traumaLevel: "Cardiovascular Emergency",
  },
];

export function MasterCADRadarMap({
  dispatches,
  telemetryFeed,
  selectedDispatchId,
  onSelectDispatch,
  className,
}: MasterCADRadarMapProps) {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Markers registries to allow smooth translation updates
  const ambulanceMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const ambulanceRotationElsRef = useRef<Map<string, HTMLElement>>(new Map());
  const pickupMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const hospitalMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync fullscreen state if user exits via ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      if (mapRef.current) {
        setTimeout(() => mapRef.current?.resize(), 100);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Initialize Mapbox WebGL Canvas once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [90.4035, 23.765], // Central Dhaka overview (Farmgate / Tejgaon)
        zoom: 12.2,
        pitch: 32,
        bearing: -8,
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

      map.on("error", () => {
        if (!mapRef.current) {
          queueMicrotask(() => {
            setMapError("Failed to initialize Mapbox WebGL vector tiles");
          });
        }
      });

      const handleResize = () => {
        map.resize();
      };
      window.addEventListener("resize", handleResize);

      const ambMarkers = ambulanceMarkersRef.current;
      const ambRotators = ambulanceRotationElsRef.current;
      const pickups = pickupMarkersRef.current;
      const hospitals = hospitalMarkersRef.current;

      return () => {
        window.removeEventListener("resize", handleResize);
        map.remove();
        mapRef.current = null;
        ambMarkers.clear();
        ambRotators.clear();
        pickups.clear();
        hospitals.clear();
      };
    } catch {
      queueMicrotask(() => {
        setMapError("Unable to initialize WebGL Master CAD Radar canvas");
      });
    }
  }, []);

  // Compute Inbound count per hospital
  const inboundCountByHospital = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of dispatches) {
      if (d.hospitalId && d.status !== DispatchStatus.COMPLETED) {
        counts.set(d.hospitalId, (counts.get(d.hospitalId) || 0) + 1);
      }
    }
    return counts;
  }, [dispatches]);

  // Render Static Hospital Hub Beacons
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    for (const hosp of DHAKA_HOSPITAL_HUBS) {
      if (!hospitalMarkersRef.current.has(hosp.id)) {
        const el = document.createElement("div");
        el.className = "hospital-hub-marker cursor-pointer group";

        const inbound = inboundCountByHospital.get(hosp.id) || 0;
        const inboundBadge =
          inbound > 0
            ? `<span class="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-emergency text-emergency-foreground text-[9px] font-bold flex items-center justify-center border border-surface shadow-md">${inbound}</span>`
            : "";

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="h-8 w-8 rounded-full bg-surface border-2 border-success shadow-lg flex items-center justify-center text-success transition-transform group-hover:scale-115">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 21v-8.25M6.75 21v-8.25M17.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5"/></svg>
            </div>
            ${inboundBadge}
          </div>
        `;

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([hosp.lng, hosp.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2 font-sans text-xs">
                <div class="font-bold text-foreground flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full bg-success"></span>
                  ${hosp.name}
                </div>
                <div class="text-[11px] text-muted-foreground mt-0.5">${hosp.traumaLevel}</div>
                <div class="text-[10px] text-muted-foreground mt-0.5">${hosp.address}</div>
                ${
                  inbound > 0
                    ? `<div class="mt-1.5 text-[11px] font-bold text-emergency font-mono">${inbound} Inbound Ambulance(s) En Route</div>`
                    : ""
                }
              </div>
            `),
          )
          .addTo(map);

        hospitalMarkersRef.current.set(hosp.id, marker);
      }
    }
  }, [mapReady, inboundCountByHospital]);

  // Synchronize All Ambulances & Incident Pickup Markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const activeDispatchIds = new Set(
      dispatches
        .filter((d) => d.status !== DispatchStatus.COMPLETED)
        .map((d) => d.id),
    );

    // 1. Remove markers for completed/cancelled missions
    for (const [id, marker] of ambulanceMarkersRef.current.entries()) {
      if (!activeDispatchIds.has(id)) {
        marker.remove();
        ambulanceMarkersRef.current.delete(id);
        ambulanceRotationElsRef.current.delete(id);
      }
    }
    for (const [id, marker] of pickupMarkersRef.current.entries()) {
      if (!activeDispatchIds.has(id)) {
        marker.remove();
        pickupMarkersRef.current.delete(id);
      }
    }

    // 2. Add or Update Markers for Active Dispatches
    for (const d of dispatches) {
      if (!activeDispatchIds.has(d.id)) continue;

      // Real-time telemetry override from live SSE feed
      const tick = telemetryFeed?.get(d.id) || d.latestTelemetry;

      // Fallback base coordinates if telemetry hasn't ticked yet
      const lat = tick?.lat ?? d.request?.pickupLat ?? 23.7516;
      const lng = tick?.lng ?? d.request?.pickupLng ?? 90.3807;
      const heading = tick?.heading ?? 0;
      const speedKmh = tick?.speedKmh ?? 0;
      const stage = tick?.stage || d.status;

      // Status ring styling
      const isCode3 =
        stage === DispatchStatus.HOSPITAL_SELECTED ||
        stage === DispatchStatus.PATIENT_PICKUP;
      const isAtBay = stage === DispatchStatus.HOSPITAL_ARRIVAL;

      let ringColorClass = "border-warning text-warning";
      if (isCode3) ringColorClass = "border-emergency text-emergency";
      if (isAtBay) ringColorClass = "border-success text-success";

      // A. Ambulance Marker
      let ambMarker = ambulanceMarkersRef.current.get(d.id);
      if (!ambMarker) {
        const containerEl = document.createElement("div");
        containerEl.className =
          "master-cad-ambulance-marker cursor-pointer group";
        containerEl.setAttribute("data-dispatch-id", d.id);

        containerEl.innerHTML = `
          <div class="relative flex flex-col items-center">
            <!-- Pulsing Radar Halo -->
            <div class="radar-ping absolute -inset-1 rounded-full ${isCode3 ? "bg-emergency/35 animate-ping" : "bg-warning/25 animate-pulse"}"></div>
            
            <!-- Vehicle Icon Capsule -->
            <div class="ambulance-rotator flex items-center justify-center h-10 w-10 rounded-full bg-card border-2 ${ringColorClass} shadow-2xl transition-transform duration-500 ease-out" style="transform: rotate(${heading}deg);">
              <!-- Direction pointer needle -->
              <div class="absolute -top-1 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-[6px] ${isCode3 ? "border-b-emergency" : "border-b-warning"}"></div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10 17h4V5H2v12h3m11 0h2m-2-4h4.382a1 1 0 0 0 .894-.553l1.894-3.789A1 1 0 0 0 22 8.211V5h-6v8Z" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>

            <!-- Callout Pill: Plate & Speed -->
            <div class="mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-card/95 border border-border shadow-md text-[10px] font-mono font-bold text-foreground whitespace-nowrap">
              <span>${d.ambulance?.vehicleNumber || "AMB"}</span>
              <span class="text-muted-foreground">•</span>
              <span class="${speedKmh > 0 ? "text-emergency" : "text-muted-foreground"}">${speedKmh}k</span>
            </div>
          </div>
        `;

        containerEl.addEventListener("click", () => {
          onSelectDispatch(d.id);
        });

        ambMarker = new mapboxgl.Marker({
          element: containerEl,
          anchor: "center",
        })
          .setLngLat([lng, lat])
          .addTo(map);

        ambulanceMarkersRef.current.set(d.id, ambMarker);
        const rotator =
          containerEl.querySelector<HTMLElement>(".ambulance-rotator");
        if (rotator) {
          ambulanceRotationElsRef.current.set(d.id, rotator);
        }
      } else {
        // Smooth translation
        ambMarker.setLngLat([lng, lat]);
        const rotator = ambulanceRotationElsRef.current.get(d.id);
        if (rotator) {
          rotator.style.transform = `rotate(${heading}deg)`;
        }
      }

      // B. Incident Pickup Pin (at request coordinates)
      if (d.request?.pickupLat && d.request?.pickupLng) {
        let pickupMarker = pickupMarkersRef.current.get(d.id);
        if (!pickupMarker) {
          const el = document.createElement("div");
          el.className = "incident-pickup-pin cursor-pointer group";

          const isCritical = d.request.priority === Priority.CRITICAL;
          const pinColor = isCritical
            ? "bg-emergency text-emergency-foreground"
            : "bg-warning text-warning-foreground";

          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              <span class="absolute h-7 w-7 rounded-full ${isCritical ? "bg-emergency/35" : "bg-warning/35"} animate-ping"></span>
              <div class="h-6 w-6 rounded-full ${pinColor} border border-surface shadow-md flex items-center justify-center text-xs font-bold">
                !
              </div>
            </div>
          `;

          el.addEventListener("click", () => {
            onSelectDispatch(d.id);
          });

          pickupMarker = new mapboxgl.Marker({
            element: el,
            anchor: "center",
          })
            .setLngLat([d.request.pickupLng, d.request.pickupLat])
            .setPopup(
              new mapboxgl.Popup({ offset: 20 }).setHTML(`
                <div class="p-2 font-sans text-xs">
                  <div class="font-bold text-foreground">Incident: ${d.request.priority}</div>
                  <div class="text-[11px] text-muted-foreground mt-0.5">${d.request.pickupAddress}</div>
                  <div class="text-[10px] text-muted-foreground mt-1">Assigned: ${d.ambulance?.vehicleNumber || "AMB"}</div>
                </div>
              `),
            )
            .addTo(map);

          pickupMarkersRef.current.set(d.id, pickupMarker);
        } else {
          pickupMarker.setLngLat([d.request.pickupLng, d.request.pickupLat]);
        }
      }
    }
  }, [
    mapReady,
    dispatches,
    telemetryFeed,
    selectedDispatchId,
    onSelectDispatch,
  ]);

  // Draw Dynamic Active Transit Route Polyline for Selected Dispatch
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const routeSourceId = "master-cad-active-route";

    const selected = dispatches.find((d) => d.id === selectedDispatchId);

    if (!selected) {
      if (map.getLayer(routeSourceId)) map.removeLayer(routeSourceId);
      if (map.getSource(routeSourceId)) map.removeSource(routeSourceId);
      return;
    }

    const tick = telemetryFeed?.get(selected.id) || selected.latestTelemetry;
    const curLat = tick?.lat ?? selected.request?.pickupLat ?? 23.7516;
    const curLng = tick?.lng ?? selected.request?.pickupLng ?? 90.3807;

    const coords: [number, number][] = [[curLng, curLat]];

    if (
      selected.status === DispatchStatus.DISPATCHED ||
      selected.status === DispatchStatus.EN_ROUTE
    ) {
      if (selected.request?.pickupLng && selected.request?.pickupLat) {
        coords.push([selected.request.pickupLng, selected.request.pickupLat]);
      }
    } else {
      if (selected.hospital?.lng && selected.hospital?.lat) {
        coords.push([selected.hospital.lng, selected.hospital.lat]);
      }
    }

    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    };

    const source = map.getSource(routeSourceId) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    } else {
      map.addSource(routeSourceId, {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: routeSourceId,
        type: "line",
        source: routeSourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#FF5A66",
          "line-width": 4,
          "line-dasharray": [2, 2],
          "line-opacity": 0.9,
        },
      });
    }

    // Auto focus camera on the selected mission
    if (coords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, {
        padding: { top: 90, bottom: 90, left: 100, right: 100 },
        maxZoom: 15,
        duration: 800,
      });
    }
  }, [mapReady, selectedDispatchId, dispatches, telemetryFeed]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // Reset to Dhaka Metropolitan overview
  const handleRecenterDhaka = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [90.4035, 23.765],
      zoom: 12.2,
      pitch: 32,
      bearing: -8,
      essential: true,
      duration: 1000,
    });
    onSelectDispatch(null);
  };

  return (
    <div
      ref={mapWrapperRef}
      className={cn(
        "relative w-full overflow-hidden bg-surface rounded-3xl border border-border/80 shadow-2xl",
        className ? className : "h-[620px] lg:h-[720px]",
      )}
    >
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Tactical Overlay Controls (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRecenterDhaka}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl text-xs font-bold text-foreground hover:bg-surface-raised shadow-xl transition-all cursor-pointer"
          title="Reset to Central Dhaka Metropolitan View"
        >
          <Crosshair className="h-3.5 w-3.5 text-emergency" />
          <span>Dhaka Overview</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl text-foreground hover:bg-surface-raised shadow-xl transition-all cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Radar"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Floating Active Radar Legend (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-xl text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" />
          <span className="text-foreground">En Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emergency animate-pulse" />
          <span className="text-foreground">Code 3 Transit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="text-foreground">Trauma Bay</span>
        </div>
      </div>

      {mapError && (
        <div className="absolute inset-0 bg-surface/90 flex flex-col items-center justify-center p-6 text-center z-30">
          <ShieldAlert className="h-10 w-10 text-emergency mb-2" />
          <h4 className="text-sm font-bold text-foreground">
            Master CAD Radar Map Offline
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Please ensure Mapbox access token is configured. Active dispatches
            can still be managed via the operations console list.
          </p>
        </div>
      )}
    </div>
  );
}
