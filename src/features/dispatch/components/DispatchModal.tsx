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
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
      title="Mobilize Emergency Dispatch"
      description="Pair an available certified vehicle and paramedic driver with this pending incident."
    >
      <div className="space-y-5 pt-2">
        {/* Incident Summary Card */}
        <div className="rounded-xl border border-border/80 bg-surface/80 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <StatusBadge
                domain="priority"
                value={request.priority}
                size="sm"
              />
              <span className="text-xs font-mono font-bold text-foreground">
                Incident #{request.id.slice(0, 8)}
              </span>
            </div>

            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-3xs font-mono font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="Direct Caller Callback"
              >
                <Phone className="h-3 w-3" />
                <span>{contactPhone}</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Caller */}
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="text-3xs uppercase tracking-wider text-muted-foreground block font-semibold">
                  Patient / Caller
                </span>
                <span className="font-medium text-foreground">
                  {request.caller?.name || "Emergency Caller"}
                </span>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-emergency shrink-0 mt-0.5" />
              <div>
                <span className="text-3xs uppercase tracking-wider text-muted-foreground block font-semibold">
                  Pickup Location
                </span>
                <span className="font-medium text-foreground">
                  {request.pickupAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Hospital / Notes row */}
          {(parsed.hospital || parsed.notes) && (
            <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {parsed.hospital && (
                <div className="flex items-center gap-2 text-3xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 text-info-ink dark:text-info shrink-0" />
                  <span>
                    Dest:{" "}
                    <strong className="text-foreground">
                      {parsed.hospital}
                    </strong>
                  </span>
                </div>
              )}
              {parsed.notes && (
                <div className="flex items-center gap-2 text-3xs text-muted-foreground sm:col-span-2 bg-background/60 p-2 rounded-lg border border-border/40">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="line-clamp-2">
                    <strong className="text-foreground">Condition:</strong>{" "}
                    {parsed.notes}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vehicle Selection Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-primary" />
              <span>Select Ambulance Unit ({ambulances.length} Available)</span>
            </label>
            {(isCritical || isHigh) && (
              <span className="text-3xs text-emergency font-semibold flex items-center gap-1">
                <Siren className="h-3 w-3" />
                ICU/ACLS Recommended
              </span>
            )}
          </div>

          {loadingAmbulances ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : ambulances.length === 0 ? (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-warning-ink dark:text-warning font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>No Emergency Ambulances Currently Available</span>
              </div>
              <p className="text-3xs text-muted-foreground">
                All vehicles in rotation are currently dispatched or undergoing
                maintenance. Please check fleet availability.
              </p>
              <Link
                href={ROUTES.ADMIN.FLEET}
                className="inline-flex items-center gap-1 text-3xs font-bold text-primary hover:underline"
              >
                Go to Fleet Management &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {ambulances.map((amb) => {
                const isSelected = activeAmbulanceId === amb.id;
                const typeInfo = AMBULANCE_TYPE_LABELS[amb.type] || {
                  label: amb.type,
                  badgeClass: "bg-surface text-muted-foreground",
                };
                const isRecommended =
                  (isCritical && amb.type === AmbulanceType.INTENSIVE_CARE) ||
                  (isHigh && amb.type === AmbulanceType.ADVANCED_LIFE_SUPPORT);

                return (
                  <button
                    key={amb.id}
                    type="button"
                    onClick={() => setSelectedAmbulanceId(amb.id)}
                    className={cn(
                      "text-left p-3 rounded-xl border transition-all cursor-pointer relative",
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
                        : "border-border/80 bg-surface/50 hover:bg-surface hover:border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Ambulance className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-mono font-bold text-xs text-foreground">
                            {amb.vehicleNumber}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "inline-block text-3xs font-semibold px-2 py-0.5 rounded-md border",
                            typeInfo.badgeClass,
                          )}
                        >
                          {typeInfo.label}
                        </span>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : isRecommended ? (
                        <Badge variant="default" size="sm" className="text-3xs">
                          Match
                        </Badge>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Paramedic Driver Selection Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Select Certified Driver ({drivers.length} On Standby)</span>
            </label>
          </div>

          {loadingDrivers ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-warning-ink dark:text-warning font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>All Certified Drivers Currently Engaged</span>
              </div>
              <p className="text-3xs text-muted-foreground">
                There are no on-duty paramedic drivers available on standby for
                deployment.
              </p>
              <Link
                href={ROUTES.ADMIN.DRIVERS}
                className="inline-flex items-center gap-1 text-3xs font-bold text-primary hover:underline"
              >
                Go to Paramedic Drivers &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {drivers.map((drv) => {
                const isSelected = activeDriverId === drv.id;
                return (
                  <button
                    key={drv.id}
                    type="button"
                    onClick={() => setSelectedDriverId(drv.id)}
                    className={cn(
                      "text-left p-3 rounded-xl border transition-all cursor-pointer relative",
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
                        : "border-border/80 bg-surface/50 hover:bg-surface hover:border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-bold text-xs text-foreground">
                            {drv.user?.name || "Paramedic Driver"}
                          </span>
                        </div>
                        <div className="flex flex-col text-3xs font-mono text-muted-foreground">
                          <span>BRTA: {drv.licenseNumber}</span>
                          {drv.user?.phone && (
                            <span>Tel: {drv.user.phone}</span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-border/80 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createDispatchMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="emergency"
            onClick={handleDispatch}
            disabled={
              !activeAmbulanceId ||
              !activeDriverId ||
              createDispatchMutation.isPending
            }
            isLoading={createDispatchMutation.isPending}
            className="gap-2 font-bold shadow-md shadow-emergency/20"
          >
            <Siren className="h-4 w-4" />
            <span>Confirm & Mobilize Siren</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
