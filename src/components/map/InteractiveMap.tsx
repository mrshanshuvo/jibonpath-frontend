"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation } from "lucide-react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface MapPoint {
  id: string;
  lng: number;
  lat: number;
  label: string;
  type: "ambulance" | "hospital";
  status?: string;
  capacity?: number;
}

interface InteractiveMapProps {
  pickup?: { lng: number; lat: number; label: string };
  destination?: { lng: number; lat: number; label: string };
  ambulances?: MapPoint[];
  hospitals?: MapPoint[];
}

export function InteractiveMap({
  pickup,
  destination,
  ambulances = [],
  hospitals = [],
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [90.4125, 23.8103],
      zoom: 11,
      pitch: 45,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach((m) => m.remove());

    ambulances.forEach((amb) => {
      const el = document.createElement("div");
      el.className = "mapboxgl-marker";
      el.innerHTML = `<div class="w-8 h-8 rounded-full bg-emergency border-2 border-white shadow-lg flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>`;
      new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([amb.lng, amb.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="text-xs font-semibold">Ambulance ${amb.id}</div><div class="text-3xs text-muted-foreground">${amb.status || "Active"}</div>`
          )
        )
        .addTo(map);
    });

    hospitals.forEach((h) => {
      const el = document.createElement("div");
      el.className = "mapboxgl-marker";
      el.innerHTML = `<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 21v-8.25M6.75 21v-8.25M17.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5"/></svg></div>`;
      new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([h.lng, h.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="text-xs font-semibold">${h.label}</div><div class="text-3xs text-muted-foreground">Capacity: ${h.capacity || "N/A"}</div>`
          )
        )
        .addTo(map);
    });

    if (pickup && destination) {
      const routeId = "route-layer";
      if (map.getSource(routeId)) {
        (map.getSource(routeId) as any).setData({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [pickup.lng, pickup.lat],
              [destination.lng, destination.lat],
            ],
          },
        });
      } else {
        map.addSource(routeId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [pickup.lng, pickup.lat],
                [destination.lng, destination.lat],
              ],
            },
          },
        });
        map.addLayer({
          id: routeId,
          type: "line",
          source: routeId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#ef4444",
            "line-width": 4,
            "line-dasharray": [2, 2],
          },
        });
      }
    }
  }, [mapReady, pickup, destination, ambulances, hospitals]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl">
      <div ref={mapContainer} className="w-full h-[420px] bg-slate-900" />
      <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border shadow-lg text-xs space-y-1">
        <div className="font-bold text-foreground flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-emergency" />
          Live Dispatch Map
        </div>
        <div className="text-muted-foreground">
          {ambulances.length} ambulances · {hospitals.length} hospitals
        </div>
      </div>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-border shadow-lg text-3xs">
          <span className="w-2 h-2 rounded-full bg-emergency" />
          <span>Ambulance</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-border shadow-lg text-3xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Hospital</span>
        </div>
      </div>
    </div>
  );
}
