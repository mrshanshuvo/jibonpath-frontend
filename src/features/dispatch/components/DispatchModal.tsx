"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Modal,
  Button,
  Badge,
  StatusBadge,
  Skeleton,
} from "@/components/shared";
import {
  Ambulance,
  User,
  Phone,
  MapPin,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Siren,
  FileText,
  Truck,
  Users,
} from "lucide-react";
import {
  AmbulanceStatus,
  AmbulanceType,
  Priority,
  type EmergencyRequest,
} from "@/types/entities.types";
import { useAmbulances } from "@/features/fleet/api/fleet.queries";
import {
  useAvailableDrivers,
  useCreateDispatch,
} from "../api/dispatch.queries";
import { parseRequestDescription } from "@/features/emergency/components/RequestCard";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequest | null;
}

const AMBULANCE_TYPE_LABELS: Record<
  AmbulanceType,
  { label: string; badgeClass: string }
> = {
  [AmbulanceType.BASIC]: {
    label: "BLS • Basic Life Support",
    badgeClass: "bg-surface text-muted-foreground border-border",
  },
  [AmbulanceType.ADVANCED_LIFE_SUPPORT]: {
    label: "ACLS • Advanced Life Support",
    badgeClass: "bg-info/10 text-info-ink dark:text-info border-info/30",
  },
  [AmbulanceType.INTENSIVE_CARE]: {
    label: "ICU • Mobile Intensive Care",
    badgeClass:
      "bg-emergency/10 text-danger-ink dark:text-emergency border-emergency/30",
  },
};

export function DispatchModal({
  isOpen,
  onClose,
  request,
}: DispatchModalProps) {
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [ambulanceFilter, setAmbulanceFilter] = useState<"ALL" | AmbulanceType>(
    "ALL",
  );

  const isModalActive = isOpen && Boolean(request);

  const { data: fleetData, isLoading: loadingAmbulances } = useAmbulances(
    {
      status: AmbulanceStatus.AVAILABLE,
      limit: 50,
    },
    { enabled: isModalActive },
  );

  const { data: driversData, isLoading: loadingDrivers } = useAvailableDrivers(
    {
      isAvailable: true,
      limit: 50,
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

  // Compute recommended / default selections
  const defaultAmbulanceId = useMemo(() => {
    if (!request || ambulances.length === 0) return "";
    if (request.priority === Priority.CRITICAL) {
      const icu = ambulances.find(
        (a) => a.type === AmbulanceType.INTENSIVE_CARE,
      );
      const acls = ambulances.find(
        (a) => a.type === AmbulanceType.ADVANCED_LIFE_SUPPORT,
      );
      return icu?.id || acls?.id || ambulances[0].id;
    }
    if (request.priority === Priority.HIGH) {
      const acls = ambulances.find(
        (a) => a.type === AmbulanceType.ADVANCED_LIFE_SUPPORT,
      );
      const icu = ambulances.find(
        (a) => a.type === AmbulanceType.INTENSIVE_CARE,
      );
      return acls?.id || icu?.id || ambulances[0].id;
    }
    return ambulances[0].id;
  }, [request, ambulances]);

  const defaultDriverId = useMemo(() => {
    return drivers.length > 0 ? drivers[0].id : "";
  }, [drivers]);

  const activeAmbulanceId = selectedAmbulanceId || defaultAmbulanceId;
  const activeDriverId = selectedDriverId || defaultDriverId;

  const activeAmbulance = useMemo(
    () => ambulances.find((a) => a.id === activeAmbulanceId),
    [ambulances, activeAmbulanceId],
  );

  const activeDriver = useMemo(
    () => drivers.find((d) => d.id === activeDriverId),
    [drivers, activeDriverId],
  );

  const filteredAmbulances = useMemo(() => {
    if (ambulanceFilter === "ALL") return ambulances;
    return ambulances.filter((a) => a.type === ambulanceFilter);
  }, [ambulances, ambulanceFilter]);

  const icuCount = ambulances.filter(
    (a) => a.type === AmbulanceType.INTENSIVE_CARE,
  ).length;
  const aclsCount = ambulances.filter(
    (a) => a.type === AmbulanceType.ADVANCED_LIFE_SUPPORT,
  ).length;
  const blsCount = ambulances.filter(
    (a) => a.type === AmbulanceType.BASIC,
  ).length;

  if (!request) return null;

  const parsed = parseRequestDescription(request.description);
  const contactPhone = parsed.phone || request.caller?.phone;

  const handleDispatch = async () => {
    if (!activeAmbulanceId || !activeDriverId) return;

    try {
      await createDispatchMutation.mutateAsync({
        requestId: request.id,
        ambulanceId: activeAmbulanceId,
        driverId: activeDriverId,
      });
      setSelectedAmbulanceId("");
      setSelectedDriverId("");
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  const isCritical = request.priority === Priority.CRITICAL;
  const isHigh = request.priority === Priority.HIGH;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      className="max-h-[92vh] overflow-y-auto p-5 sm:p-7"
      title="Mobilize Emergency Dispatch"
      description="CAD Incident Command • Pair certified emergency response units with real-time metropolitan triage."
    >
      <div className="space-y-6 pt-1">
        {/* Main 2-Column Command Center Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Incident Dossier & Protocol Telemetry (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Incident Summary Card */}
            <div className="rounded-2xl border border-border/80 bg-surface/80 p-5 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <StatusBadge
                    domain="priority"
                    value={request.priority}
                    size="default"
                  />
                  <span className="text-sm font-mono font-bold text-foreground">
                    #{request.id.slice(0, 8)}
                  </span>
                </div>

                {contactPhone && (
                  <a
                    href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                    title="Direct Caller Callback"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{contactPhone}</span>
                  </a>
                )}
              </div>

              {/* Patient and Pickup Information */}
              <div className="space-y-3.5 text-sm">
                {/* Caller identity */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised border border-border shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
                      Patient / Caller
                    </span>
                    <span className="font-semibold text-base text-foreground">
                      {request.caller?.name || "Emergency Caller"}
                    </span>
                    {contactPhone && (
                      <span className="text-xs font-mono text-muted-foreground block mt-0.5">
                        {contactPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="flex items-start gap-3 bg-surface p-3.5 rounded-xl border border-border/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency/10 border border-emergency/20 shrink-0 mt-0.5 text-emergency">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-emergency block font-bold">
                      Emergency Pickup Location
                    </span>
                    <p className="font-semibold text-sm text-foreground mt-0.5 leading-snug wrap-break-word">
                      {request.pickupAddress}
                    </p>
                  </div>
                </div>

                {/* Destination Hospital */}
                <div className="flex items-start gap-3 bg-surface p-3.5 rounded-xl border border-border/60">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0 mt-0.5 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-wider text-primary block font-bold">
                      Destination Hospital Bay
                    </span>
                    <p className="font-semibold text-sm text-foreground mt-0.5 leading-snug wrap-break-word">
                      {parsed.hospital ||
                        "Closest Available Emergency Room (DMCH)"}
                    </p>
                  </div>
                </div>

                {/* Clinical Condition / Triage Notes */}
                {parsed.notes && (
                  <div className="flex items-start gap-3 bg-background/80 p-3.5 rounded-xl border border-border/70 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised border border-border shrink-0 mt-0.5 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
                        Triage Symptoms & Condition
                      </span>
                      <p className="text-sm text-foreground font-medium mt-0.5 leading-relaxed">
                        {parsed.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Dispatch Pair Summary Card */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Siren className="h-4 w-4" />
                  Current Mobilization Pair
                </span>
                <span className="text-xs font-bold rounded-full bg-primary/15 text-primary px-2.5 py-0.5">
                  READY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface/80 p-3 rounded-xl border border-border/60 space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold block uppercase">
                    Ambulance
                  </span>
                  <div className="font-mono font-bold text-sm text-foreground">
                    {activeAmbulance?.vehicleNumber || "Select Unit"}
                  </div>
                  <span className="text-xs text-primary font-medium block">
                    {activeAmbulance
                      ? AMBULANCE_TYPE_LABELS[
                          activeAmbulance.type
                        ]?.label.split("•")[0]
                      : "—"}
                  </span>
                </div>

                <div className="bg-surface/80 p-3 rounded-xl border border-border/60 space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold block uppercase">
                    Paramedic Driver
                  </span>
                  <div className="font-bold text-sm text-foreground truncate">
                    {activeDriver?.user?.name || "Select Crew"}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono block truncate">
                    {activeDriver?.licenseNumber || "—"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Automated traffic siren corridor and hospital telemetry
                handshake will trigger instantly on mobilization.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Selection Grids for Ambulance & Driver (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Ambulance Unit Allocation */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>
                    Select Ambulance Unit ({ambulances.length} Active in Dhaka)
                  </span>
                </label>

                {(isCritical || isHigh) && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emergency font-bold bg-emergency/10 border border-emergency/30 px-2.5 py-1 rounded-full">
                    <Siren className="h-3.5 w-3.5 animate-pulse" />
                    ICU/ACLS Recommended
                  </span>
                )}
              </div>

              {/* Ambulance Fleet Tier Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setAmbulanceFilter("ALL")}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                    ambulanceFilter === "ALL"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                  )}
                >
                  All ({ambulances.length})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAmbulanceFilter(AmbulanceType.INTENSIVE_CARE)
                  }
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                    ambulanceFilter === AmbulanceType.INTENSIVE_CARE
                      ? "bg-emergency text-emergency-foreground border-emergency shadow-xs"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                  )}
                >
                  ICU ({icuCount})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAmbulanceFilter(AmbulanceType.ADVANCED_LIFE_SUPPORT)
                  }
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                    ambulanceFilter === AmbulanceType.ADVANCED_LIFE_SUPPORT
                      ? "bg-info text-info-foreground border-info shadow-xs"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                  )}
                >
                  ACLS ({aclsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAmbulanceFilter(AmbulanceType.BASIC)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer",
                    ambulanceFilter === AmbulanceType.BASIC
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-xs"
                      : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                  )}
                >
                  BLS ({blsCount})
                </button>
              </div>

              {loadingAmbulances ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : filteredAmbulances.length === 0 ? (
                <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 text-sm space-y-2">
                  <div className="flex items-center gap-2 text-warning-ink dark:text-warning font-bold">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>No Matching Ambulances Found</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No available units match the selected tier filter. Switch to
                    &quot;All&quot; to review the full fleet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                  {filteredAmbulances.map((amb) => {
                    const isSelected = activeAmbulanceId === amb.id;
                    const typeInfo = AMBULANCE_TYPE_LABELS[amb.type] || {
                      label: amb.type,
                      badgeClass: "bg-surface text-muted-foreground",
                    };
                    const isRecommended =
                      (isCritical &&
                        amb.type === AmbulanceType.INTENSIVE_CARE) ||
                      (isHigh &&
                        amb.type === AmbulanceType.ADVANCED_LIFE_SUPPORT);

                    return (
                      <button
                        key={amb.id}
                        type="button"
                        onClick={() => setSelectedAmbulanceId(amb.id)}
                        className={cn(
                          "text-left p-3.5 rounded-xl border transition-all cursor-pointer relative",
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                            : "border-border/80 bg-surface/60 hover:bg-surface-raised hover:border-border",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <Ambulance className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-mono font-bold text-sm sm:text-base text-foreground">
                                {amb.vehicleNumber}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md border",
                                typeInfo.badgeClass,
                              )}
                            >
                              {typeInfo.label}
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {isSelected ? (
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                            ) : (
                              <span className="h-4 w-4 rounded-full border border-border/80" />
                            )}
                            {isRecommended && !isSelected && (
                              <Badge
                                variant="default"
                                size="sm"
                                className="text-xs"
                              >
                                Match
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Certified Paramedic Driver Allocation */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    Select Certified Driver ({drivers.length} On Standby)
                  </span>
                </label>
              </div>

              {loadingDrivers ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : drivers.length === 0 ? (
                <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 text-sm space-y-2">
                  <div className="flex items-center gap-2 text-warning-ink dark:text-warning font-bold">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>All Certified Drivers Currently Engaged</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    There are no on-duty paramedic drivers available on standby
                    for deployment.
                  </p>
                  <Link
                    href={ROUTES.ADMIN.DRIVERS}
                    className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    Go to Paramedic Drivers &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                  {drivers.map((drv) => {
                    const isSelected = activeDriverId === drv.id;
                    return (
                      <button
                        key={drv.id}
                        type="button"
                        onClick={() => setSelectedDriverId(drv.id)}
                        className={cn(
                          "text-left p-3.5 rounded-xl border transition-all cursor-pointer relative",
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                            : "border-border/80 bg-surface/60 hover:bg-surface-raised hover:border-border",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-bold text-sm sm:text-base text-foreground truncate">
                                {drv.user?.name || "Paramedic Driver"}
                              </span>
                            </div>
                            <div className="flex flex-col text-xs font-mono text-muted-foreground">
                              <span>BRTA: {drv.licenseNumber}</span>
                              {drv.user?.phone && (
                                <span className="text-xs text-primary font-medium">
                                  Tel: {drv.user.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          ) : (
                            <span className="h-4 w-4 rounded-full border border-border/80 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-muted-foreground hidden sm:block">
            {activeAmbulance && activeDriver ? (
              <span>
                Dispatching{" "}
                <strong className="text-foreground">
                  {activeAmbulance.vehicleNumber}
                </strong>{" "}
                with Paramedic{" "}
                <strong className="text-foreground">
                  {activeDriver.user?.name}
                </strong>
              </span>
            ) : (
              <span>
                Select both an ambulance and certified driver to continue
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={createDispatchMutation.isPending}
            >
              Cancel &amp; Return
            </Button>

            <Button
              type="button"
              variant="emergency"
              size="lg"
              onClick={handleDispatch}
              disabled={
                !activeAmbulanceId ||
                !activeDriverId ||
                createDispatchMutation.isPending
              }
              isLoading={createDispatchMutation.isPending}
              className="gap-2 font-bold px-7 h-12 shadow-lg shadow-emergency/25 cursor-pointer"
            >
              <Siren className="h-5 w-5" />
              <span>Confirm &amp; Mobilize Siren</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
