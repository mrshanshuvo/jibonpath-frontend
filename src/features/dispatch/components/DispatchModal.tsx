"use client";

import { useMemo, useState } from "react";
import {
  Siren,
  Sparkles,
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
import { Modal, Button } from "@/components/shared";
import { useDebounce } from "@/hooks/useDebounce";
import { IncidentDossierCard } from "./IncidentDossierCard";
import { MobilizationPairSummary } from "./MobilizationPairSummary";
import { AmbulanceUnitSelector } from "./AmbulanceUnitSelector";
import { DriverSelector } from "./DriverSelector";

export interface DispatchModalProps {
  request: EmergencyRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DispatchModal({ request, isOpen, onClose }: DispatchModalProps) {
  const isModalActive = Boolean(isOpen && request);

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

  const { data: fleetData, isLoading: loadingAmbulances } = useAmbulances(
    {
      status: AmbulanceStatus.AVAILABLE,
      type: ambulanceFilter === "ALL" ? undefined : ambulanceFilter,
      search: debouncedAmbulanceSearch || undefined,
      page: ambulancePage,
      limit: 6,
    },
    { enabled: isModalActive },
  );

  const { data: driversData, isLoading: loadingDrivers } = useAvailableDrivers(
    {
      isAvailable: true,
      search: debouncedDriverSearch || undefined,
      page: driverPage,
      limit: 6,
    },
    { enabled: isModalActive },
  );

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
    if (ambulances.length === 0 || !request) return null;
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
  }, [ambulances, request]);

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

  const handleClose = () => {
    setUserSelectedAmbulance(null);
    setUserSelectedDriver(null);
    setAmbulancePage(1);
    setDriverPage(1);
    setAmbulanceSearch("");
    setDriverSearch("");
    setAmbulanceFilter("ALL");
    onClose();
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

  if (!request) return null;

  if (!request) return null;

  const isCritical = request.priority === Priority.CRITICAL;
  const isHigh = request.priority === Priority.HIGH;

  const handleDispatch = async () => {
    if (!activeAmbulanceId || !activeDriverId) return;

    try {
      await createDispatchMutation.mutateAsync({
        requestId: request.id,
        ambulanceId: activeAmbulanceId,
        driverId: activeDriverId,
      });
      handleClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rapid Dispatch Mobilization"
      description="Autonomous Pairing & Siren Deployment Protocol"
      size="6xl"
    >
      <div className="space-y-6 pt-2">
        {/* Recommendation Alert Banner */}
        <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-foreground">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>
              Autonomous Triage Match: Optimal emergency ambulance and certified
              driver calculated based on patient clinical urgency.
            </span>
          </div>
          <span className="text-primary font-bold whitespace-nowrap text-xs">
            Priority Protocol Active
          </span>
        </div>

        {/* Two-Column Responsive Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Patient Dossier & Mobilization Confirmation (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            <IncidentDossierCard request={request} />

            <MobilizationPairSummary
              activeAmbulance={activeAmbulance ?? undefined}
              activeDriver={activeDriver ?? undefined}
              isSubmitting={createDispatchMutation.isPending}
              onConfirm={handleDispatch}
            />
          </div>

          {/* RIGHT COLUMN: Selection Grids for Ambulance & Driver (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <AmbulanceUnitSelector
              ambulances={ambulances}
              selectedAmbulanceId={activeAmbulanceId}
              selectedAmbulance={activeAmbulance}
              onSelectAmbulance={handleSelectAmbulance}
              isCritical={isCritical}
              isHigh={isHigh}
              isLoading={loadingAmbulances}
              columns={2}
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

            <div className="pt-2 border-t border-border/60">
              <DriverSelector
                drivers={drivers}
                selectedDriverId={activeDriverId}
                selectedDriver={activeDriver}
                onSelectDriver={handleSelectDriver}
                isLoading={loadingDrivers}
                columns={2}
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

        {/* Modal Bottom Actions Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="text-xs text-muted-foreground font-medium text-center sm:text-left">
            Dispatching{" "}
            <strong className="text-foreground">
              {activeAmbulance?.vehicleNumber || "Unit"}
            </strong>{" "}
            with Paramedic{" "}
            <strong className="text-foreground">
              {activeDriver?.user?.name || "Driver"}
            </strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createDispatchMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              Cancel & Return
            </Button>
            <Button
              type="button"
              variant="emergency"
              disabled={
                !activeAmbulanceId ||
                !activeDriverId ||
                createDispatchMutation.isPending
              }
              isLoading={createDispatchMutation.isPending}
              onClick={handleDispatch}
              className="flex-1 sm:flex-initial gap-2 px-6 h-11 text-sm font-bold shadow-md shadow-emergency/25"
            >
              <Siren className="h-4 w-4 animate-pulse" />
              <span>Confirm & Mobilize Siren</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
