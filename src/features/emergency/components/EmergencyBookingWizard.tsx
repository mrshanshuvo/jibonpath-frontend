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
} from "lucide-react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { Priority } from "@/types/entities.types";
import {
  createEmergencyRequestSchema,
  type CreateEmergencyRequestInput,
} from "../types";
import { useCreateRequest } from "../api/emergency.queries";
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
  const { resolve: reverseGeocode, isResolving } = useReverseGeocode();

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
  const isBusy = createMutation.isPending || detectingGps || isResolving;
  const gpsLoading = detectingGps || isResolving;

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
            placeholder="+880 1XXX-XXXXXX"
            error={errors.contactPhone?.message}
            required
            {...register("contactPhone")}
          />

          <Select
            label="Receiving hospital"
            leftIcon={<Building2 className="h-4 w-4" />}
            error={errors.hospitalName?.message}
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
          disabled={isBusy}
          leftIcon={<Send className="h-5 w-5" aria-hidden="true" />}
        >
          Review &amp; Dispatch Ambulance
        </Button>
      </form>

      <ReviewStep
        isOpen={pendingData !== null}
        data={pendingData}
        isSubmitting={createMutation.isPending}
        onCancel={() => setPendingData(null)}
        onConfirm={handleConfirmDispatch}
      />
    </>
  );
}
