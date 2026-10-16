"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  Crosshair,
  HeartPulse,
  MapPin,
  Send,
  Building2,
  Ambulance,
  AlertTriangle,
} from "lucide-react";
import { Button, Card, Input, Select, Textarea, Badge } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { Priority, RequestStatus } from "@/types/entities.types";
import {
  createEmergencyRequestSchema,
  type CreateEmergencyRequestInput,
} from "../types";
import {
  useCreateRequest,
  useMyRequests,
  useCancelRequest,
} from "../api/emergency.queries";
import { useReverseGeocode } from "../hooks/useReverseGeocode";
import { SeveritySelector } from "./SeveritySelector";
import { ReviewStep } from "./ReviewStep";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const QUICK_LOCATIONS = [
  { name: "Dhanmondi Lake / Rd 27", lat: 23.7461, lng: 90.3742 },
  { name: "Gulshan 1 Circle", lat: 23.7788, lng: 90.4172 },
  { name: "Uttara Sector 3", lat: 23.8712, lng: 90.3986 },
  { name: "Mirpur 10 Roundabout", lat: 23.8071, lng: 90.3686 },
  { name: "Motijheel C/A", lat: 23.7334, lng: 90.4178 },
] as const;

const POPULAR_HOSPITALS = [
  "Dhaka Medical College Hospital (DMCH)",
  "Square Hospital Ltd. (Panthapath)",
  "United Hospital (Gulshan)",
  "Evercare Hospital Dhaka (Bashundhara)",
  "NICVD (Sher-e-Bangla Nagar)",
  "Kurmitola General Hospital",
  "Closest Available Emergency Room",
];

const DEFAULT_HOSPITAL = "Closest Available Emergency Room";

interface BookingWizardProps {
  initialDestination?: string;
}

export function EmergencyBookingWizard({
  initialDestination,
}: BookingWizardProps) {
  const router = useRouter();
  const createMutation = useCreateRequest();
  const cancelMutation = useCancelRequest();
  const { resolve: reverseGeocode, isResolving } = useReverseGeocode();

  const { data: myPendingData } = useMyRequests({
    status: RequestStatus.PENDING,
    limit: 1,
  });
  const activePendingRequest = myPendingData?.requests?.[0];

  const [detectingGps, setDetectingGps] = useState(false);
  const [pendingData, setPendingData] =
    useState<CreateEmergencyRequestInput | null>(null);

  const hospitalOptions =
    initialDestination && !POPULAR_HOSPITALS.includes(initialDestination)
      ? [initialDestination, ...POPULAR_HOSPITALS]
      : POPULAR_HOSPITALS;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateEmergencyRequestInput>({
    mode: "onChange",
    resolver: zodResolver(createEmergencyRequestSchema),
    defaultValues: {
      priority: Priority.CRITICAL,
      pickupAddress: "",
      description: "",
      contactPhone: "",
      hospitalName: initialDestination || DEFAULT_HOSPITAL,
    },
  });

  const priority = useWatch({ control, name: "priority" });
  const pickupAddress = useWatch({ control, name: "pickupAddress" });
  const contactPhone = useWatch({ control, name: "contactPhone" });
  const isBusy = createMutation.isPending || detectingGps || isResolving;
  const gpsLoading = detectingGps || isResolving;

  const handleCancelActiveRequest = (requestId: string) => {
    cancelMutation.mutate(requestId, {
      onSuccess: () => {
        toast.success(
          "Previous pending request cancelled. You can now dispatch your new ambulance request.",
        );
      },
    });
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by this browser.");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue("pickupLat", latitude, { shouldValidate: true });
        setValue("pickupLng", longitude, { shouldValidate: true });

        const { address } = await reverseGeocode({
          lat: latitude,
          lng: longitude,
        });
        setValue("pickupAddress", address, { shouldValidate: true });
        setDetectingGps(false);
        toast.success("Location detected");
      },
      (err) => {
        setDetectingGps(false);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please enter the address manually."
            : "Couldn't get your location. Please enter the address manually.",
        );
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleSelectQuickLocation = (loc: (typeof QUICK_LOCATIONS)[number]) => {
    setValue("pickupAddress", loc.name, { shouldValidate: true });
    setValue("pickupLat", loc.lat);
    setValue("pickupLng", loc.lng);
  };

  const handleReview = (data: CreateEmergencyRequestInput) => {
    setPendingData(data);
  };

  const handleConfirmDispatch = () => {
    if (!pendingData) return;
    createMutation.mutate(pendingData, {
      onSuccess: () => {
        setPendingData(null);
        toast.success("Ambulance dispatched. Help is on the way.");
        router.push(ROUTES.PATIENT.DASHBOARD);
      },
      onError: () => {
        setPendingData(null);
        toast.error("Dispatch failed. Please try again or call 999 directly.");
      },
    });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleReview)}
        className="space-y-6"
        aria-busy={isBusy || undefined}
      >
        {/* Status banner — static until real telemetry is wired. */}
        <div className="rounded-lg border border-emergency/40 bg-emergency/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emergency text-emergency-foreground">
              <HeartPulse className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Emergency Dispatch Ready
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your details below and confirm to send an ambulance.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-success" aria-hidden="true" />
            <span>Direct dispatch line: 999</span>
          </div>
        </div>

        {/* Active Pending Request Warning Card */}
        {activePendingRequest && (
          <div className="rounded-xl border border-warning/50 bg-warning/10 p-4 sm:p-5 text-warning-foreground space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      Active Emergency Dispatch in Progress
                    </h3>
                    <Badge variant="warning" size="sm">
                      PENDING DISPATCH
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    You currently have an active pending ambulance request (
                    <span className="font-mono text-foreground font-semibold">
                      #{activePendingRequest.id.slice(0, 8)}
                    </span>
                    ) for{" "}
                    <span className="font-semibold text-foreground">
                      {activePendingRequest.pickupAddress}
                    </span>
                    . To prevent duplicate ambulances, only one pending dispatch
                    is allowed per account at a time.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-warning/20">
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => router.push(ROUTES.PATIENT.DASHBOARD)}
              >
                Track Active Ambulance
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleCancelActiveRequest(activePendingRequest.id)
                }
                isLoading={cancelMutation.isPending}
                loadingText="Cancelling Request..."
              >
                Cancel Previous Request to Book New One
              </Button>
            </div>
          </div>
        )}

        {/* Visual Step Progress Bar */}
        <div className="flex items-center gap-2 mb-2">
          {[
            { label: "Severity", done: true },
            { label: "Location", done: !!pickupAddress },
            { label: "Hospital", done: false },
            { label: "Confirm", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={`h-2 rounded-full flex-1 transition-colors ${
                  step.done ? "bg-emergency" : "bg-border"
                }`}
              />
              {i < 3 && (
                <span className="text-xs text-muted-foreground font-bold">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-semibold text-muted-foreground px-1 mb-4">
          <span>Severity</span>
          <span>Location</span>
          <span>Hospital</span>
          <span>Confirm</span>
        </div>

        <Card className="p-5 sm:p-6">
          <SeveritySelector
            value={priority}
            onChange={(p) => setValue("priority", p, { shouldValidate: true })}
            error={errors.priority?.message}
            disabled={isBusy}
          />
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
                Step 2: Pickup Location
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Street address, landmark, or use your current location.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDetectGps}
              isLoading={gpsLoading}
              loadingText="Detecting…"
              disabled={isBusy && !gpsLoading}
              leftIcon={
                <Crosshair
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden="true"
                />
              }
            >
              Use my location
            </Button>
          </div>

          <Input
            label="Pickup address"
            placeholder="e.g. House 42, Road 9/A, Dhanmondi, Dhaka"
            leftIcon={<MapPin className="h-4 w-4" />}
            error={errors.pickupAddress?.message}
            helperText={
              !errors.pickupAddress &&
              pickupAddress &&
              pickupAddress.trim().length >= 5
                ? "✓ Valid pickup location"
                : "Enter street address, building, or road (min. 5 characters)"
            }
            required
            {...register("pickupAddress")}
          />

          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Common locations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LOCATIONS.map((loc) => {
                const isUsed = pickupAddress === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    aria-pressed={isUsed}
                    onClick={() => handleSelectQuickLocation(loc)}
                    disabled={isBusy}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                      isUsed
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/70 bg-surface text-muted-foreground hover:text-foreground hover:border-primary",
                    )}
                  >
                    {loc.name}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
              Step 3: Patient &amp; Destination
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tell us who to call and where to take the patient.
            </p>
          </div>

          <Input
            label="Callback phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+880 1XXX-XXXXXX or 01XXXXXXXXX"
            error={errors.contactPhone?.message}
            helperText={
              !errors.contactPhone &&
              contactPhone &&
              /^(?:\+?880\s?|0)1[3-9]\d{8}$|^[+\d][\d\s\-()]{7,16}$/.test(
                contactPhone,
              )
                ? "✓ Valid callback phone number"
                : "Dispatcher will call this number to verify location"
            }
            required
            {...register("contactPhone")}
          />

          <Select
            label="Receiving hospital"
            leftIcon={<Building2 className="h-4 w-4" />}
            error={errors.hospitalName?.message}
            helperText="Emergency paramedics will transport patient to this facility"
            required
            {...register("hospitalName")}
          >
            {hospitalOptions.map((hosp) => (
              <option key={hosp} value={hosp}>
                {hosp}
              </option>
            ))}
          </Select>

          <Textarea
            label="Symptoms & critical notes (optional)"
            rows={3}
            maxLength={500}
            showCount
            placeholder="e.g. 58-year-old male with sudden left-arm numbness and breathing tightness"
            error={errors.description?.message}
            {...register("description")}
          />
        </Card>

        <Button
          type="submit"
          variant="emergency"
          size="lg"
          className="w-full"
          disabled={
            isBusy || cancelMutation.isPending || !!activePendingRequest
          }
          leftIcon={<Send className="h-5 w-5" aria-hidden="true" />}
        >
          {activePendingRequest
            ? "Active Dispatch Pending (Cancel Above to Dispatch Again)"
            : "Review & Dispatch Ambulance"}
        </Button>
      </form>

      <ReviewStep
        isOpen={pendingData !== null}
        data={pendingData}
        isSubmitting={createMutation.isPending}
        onCancel={() => setPendingData(null)}
        onConfirm={handleConfirmDispatch}
      />
      {/* Real-time ETA & Ambulance Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Card className="p-4 bg-surface border-border">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Estimated Arrival
          </div>
          <div className="text-2xl font-extrabold text-emergency">8–12 min</div>
          <div className="text-xs text-muted-foreground mt-1">
            Based on nearest available unit
          </div>
        </Card>
        <Card className="p-4 bg-surface border-border">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Nearest Unit
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emergency/10 flex items-center justify-center">
              <Ambulance className="h-4 w-4 text-emergency" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">AMB-07</div>
              <div className="text-xs text-muted-foreground">
                ACLS · 1.2 km away
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-surface border-border">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Equipment
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Defibrillator", "Ventilator", "O2", "ECG"].map((item) => (
              <span
                key={item}
                className="text-xs px-2.5 py-0.5 rounded-full bg-primary-soft text-primary font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
