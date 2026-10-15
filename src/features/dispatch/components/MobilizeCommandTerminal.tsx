"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Navigation,
} from "lucide-react";
import {
  AmbulanceStatus,
  AmbulanceType,
  Priority,
  type Ambulance,
  type Driver,
  type EmergencyRequest,
} from "@/types/entities.types";
import {
  useAvailableDrivers,
  useCreateDispatch,
} from "../api/dispatch.queries";
import { useAmbulances } from "@/features/fleet/api/fleet.queries";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/config/routes";
import { IncidentDossierCard } from "./IncidentDossierCard";
import { MobilizationPairSummary } from "./MobilizationPairSummary";
import { AmbulanceUnitSelector } from "./AmbulanceUnitSelector";
import { DriverSelector } from "./DriverSelector";

export interface MobilizeCommandTerminalProps {
  request: EmergencyRequest;
}

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badgeClass: string; dotClass: string }
> = {
  [Priority.CRITICAL]: {
    label: "P1 Critical Emergency",
    badgeClass:
      "bg-emergency/15 text-danger-ink dark:text-emergency border-emergency/30 font-bold",
    dotClass: "bg-emergency animate-ping",
  },
  [Priority.HIGH]: {
    label: "P2 High Priority",
    badgeClass:
      "bg-warning/15 text-warning-ink dark:text-warning border-warning/30 font-bold",
    dotClass: "bg-warning",
  },
  [Priority.MEDIUM]: {
    label: "P3 Medium",
    badgeClass: "bg-info/15 text-info-ink dark:text-info border-info/30",
    dotClass: "bg-info",
  },
  [Priority.LOW]: {
    label: "P4 Low",
    badgeClass: "bg-surface text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

export function MobilizeCommandTerminal({ request }: MobilizeCommandTerminalProps) {
  const router = useRouter();

  // Ambulance search and pagination state
  const [ambulancePage, setAmbulancePage] = useState(1);
  const [ambulanceSearch, setAmbulanceSearch] = useState("");
  const [ambulanceFilter, setAmbulanceFilter] = useState<"ALL" | AmbulanceType>("ALL");
  const debouncedAmbulanceSearch = useDebounce(ambulanceSearch, 300);

  // Driver search and pagination state
  const [driverPage, setDriverPage] = useState(1);
  const [driverSearch, setDriverSearch] = useState("");
  const debouncedDriverSearch = useDebounce(driverSearch, 300);

  // Explicit user selection state
  const [userSelectedAmbulance, setUserSelectedAmbulance] = useState<Ambulance | null>(null);
  const [userSelectedDriver, setUserSelectedDriver] = useState<Driver | null>(null);

  // Queries
  const { data: fleetData, isLoading: loadingAmbulances } = useAmbulances({
    status: AmbulanceStatus.AVAILABLE,
    type: ambulanceFilter === "ALL" ? undefined : ambulanceFilter,
    search: debouncedAmbulanceSearch || undefined,
    page: ambulancePage,
    limit: 6,
  });

  const { data: driversData, isLoading: loadingDrivers } = useAvailableDrivers({
    isAvailable: true,
    search: debouncedDriverSearch || undefined,
    page: driverPage,
    limit: 6,
  });

  const createDispatchMutation = useCreateDispatch();

  const ambulances = useMemo(
    () => fleetData?.ambulances ?? [],
    [fleetData?.ambulances],
  );
  const drivers = useMemo(
    () => driversData?.drivers ?? [],
    [driversData?.drivers],
  );

  // Derived recommended selections
  const recommendedAmbulance = useMemo(() => {
    if (ambulances.length === 0) return null;
    if (request.priority === Priority.CRITICAL) {
      return (
        ambulances.find((a) => a.type === AmbulanceType.INTENSIVE_CARE) ||
        ambulances.find((a) => a.type === AmbulanceType.ADVANCED_LIFE_SUPPORT) ||
        ambulances[0]
      );
    }
    if (request.priority === Priority.HIGH) {
      return (
        ambulances.find((a) => a.type === AmbulanceType.ADVANCED_LIFE_SUPPORT) ||
        ambulances.find((a) => a.type === AmbulanceType.INTENSIVE_CARE) ||
        ambulances[0]
      );
    }
    return ambulances[0];
  }, [ambulances, request.priority]);

  const recommendedDriver = useMemo(() => {
    return drivers.length > 0 ? drivers[0] : null;
  }, [drivers]);

  const activeAmbulance = userSelectedAmbulance ?? recommendedAmbulance;
  const activeDriver = userSelectedDriver ?? recommendedDriver;
  const activeAmbulanceId = activeAmbulance?.id || "";
  const activeDriverId = activeDriver?.id || "";

  const handleSelectAmbulance = (id: string, amb?: Ambulance) => {
    if (amb) {
      setUserSelectedAmbulance(amb);
    } else if (!id) {
      setUserSelectedAmbulance(null);
    } else {
      const found = ambulances.find((a) => a.id === id) || null;
      setUserSelectedAmbulance(found);
    }
  };

  const handleSelectDriver = (id: string, drv?: Driver) => {
    if (drv) {
      setUserSelectedDriver(drv);
    } else if (!id) {
      setUserSelectedDriver(null);
    } else {
      const found = drivers.find((d) => d.id === id) || null;
      setUserSelectedDriver(found);
    }
  };

  const handleAmbulanceSearch = (val: string) => {
    setAmbulanceSearch(val);
    setAmbulancePage(1);
  };

  const handleAmbulanceFilter = (type: "ALL" | AmbulanceType) => {
    setAmbulanceFilter(type);
    setAmbulancePage(1);
  };

  const handleDriverSearch = (val: string) => {
    setDriverSearch(val);
    setDriverPage(1);
  };

  const isCritical = request.priority === Priority.CRITICAL;
  const isHigh = request.priority === Priority.HIGH;
  const priorityInfo = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG[Priority.LOW];

  // Map markers
  const pickupPoint = request.pickupLat && request.pickupLng ? {
    lat: Number(request.pickupLat),
    lng: Number(request.pickupLng),
    label: request.pickupAddress,
  } : {
    lat: 23.8103,
    lng: 90.4125,
    label: request.pickupAddress || "Dhaka Central Pickup",
  };

  const mapAmbulanceMarkers = ambulances.slice(0, 15).map((a, idx) => ({
    id: a.vehicleNumber,
    lat: pickupPoint.lat + (Math.sin(idx + 1) * 0.025),
    lng: pickupPoint.lng + (Math.cos(idx + 1) * 0.025),
    label: `${a.vehicleNumber} (${a.type})`,
    type: "ambulance" as const,
    status: a.status,
  }));

  const handleMobilize = async () => {
    if (!activeAmbulanceId || !activeDriverId) return;

    try {
      await createDispatchMutation.mutateAsync({
        requestId: request.id,
        ambulanceId: activeAmbulanceId,
        driverId: activeDriverId,
      });
      router.push(ROUTES.ADMIN.DISPATCHES);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.ADMIN.DISPATCHES)}
            className="p-2 rounded-xl border border-border/80 hover:bg-surface-raised text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back to active dispatches"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
                Mobilization Terminal
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-mono text-primary font-bold">
                INC-{request.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Emergency Vehicle & Paramedic Mobilization
            </h1>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-black shadow-xs ${priorityInfo.badgeClass}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${priorityInfo.dotClass}`} />
            <span>{priorityInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Grid: Dossier + Pairing Summary (Left) & Selection Terminal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Incident Dossier & Confirmation Command Deck (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
          <IncidentDossierCard request={request} />

          <MobilizationPairSummary
            activeAmbulance={activeAmbulance ?? undefined}
            activeDriver={activeDriver ?? undefined}
            isSubmitting={createDispatchMutation.isPending}
            onConfirm={handleMobilize}
          />
        </div>

        {/* RIGHT COLUMN: Interactive Tactical Map + Units & Drivers Grids (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tactical Map Container */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emergency" />
                <h3 className="text-sm font-bold text-foreground">
                  Live Tactical Dispatch Map
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Dhaka Metropolitan Dispatch Grid
              </span>
            </div>

            <InteractiveMap
              pickup={pickupPoint}
              ambulances={mapAmbulanceMarkers}
            />
          </div>

          {/* Allocation Grids Card with Server Pagination & Debounced Search */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-6 shadow-sm">
            <AmbulanceUnitSelector
              ambulances={ambulances}
              selectedAmbulanceId={activeAmbulanceId}
              selectedAmbulance={activeAmbulance}
              onSelectAmbulance={handleSelectAmbulance}
              isCritical={isCritical}
              isHigh={isHigh}
              isLoading={loadingAmbulances}
              columns={3}
              search={ambulanceSearch}
              onSearchChange={handleAmbulanceSearch}
              filterType={ambulanceFilter}
              onFilterTypeChange={handleAmbulanceFilter}
              pagination={
                fleetData?.meta
                  ? {
                      page: fleetData.meta.page,
                      totalPages: fleetData.meta.totalPages,
                      total: fleetData.meta.total,
                      limit: fleetData.meta.limit,
                      onPageChange: setAmbulancePage,
                    }
                  : undefined
              }
            />

            <div className="pt-4 border-t border-border/60">
              <DriverSelector
                drivers={drivers}
                selectedDriverId={activeDriverId}
                selectedDriver={activeDriver}
                onSelectDriver={handleSelectDriver}
                isLoading={loadingDrivers}
                columns={3}
                search={driverSearch}
                onSearchChange={handleDriverSearch}
                pagination={
                  driversData?.meta
                    ? {
                        page: driversData.meta.page,
                        totalPages: driversData.meta.totalPages,
                        total: driversData.meta.total,
                        limit: driversData.meta.limit,
                        onPageChange: setDriverPage,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
