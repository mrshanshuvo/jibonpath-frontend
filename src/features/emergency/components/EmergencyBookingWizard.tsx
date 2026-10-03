"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  HeartPulse,
  Flame,
  Activity,
  MapPin,
  Crosshair,
  Building2,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { Priority } from "@/types/entities.types";
import {
  createEmergencyRequestSchema,
  type CreateEmergencyRequestInput,
} from "../types";
import { useCreateRequest } from "../api/emergency.queries";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const QUICK_LOCATIONS = [
  { name: "Dhanmondi Lake / Rd 27", lat: 23.7461, lng: 90.3742 },
  { name: "Gulshan 1 Circle", lat: 23.7788, lng: 90.4172 },
  { name: "Uttara Sector 3", lat: 23.8712, lng: 90.3986 },
  { name: "Mirpur 10 Roundabout", lat: 23.8071, lng: 90.3686 },
  { name: "Motijheel C/A", lat: 23.7334, lng: 90.4178 },
];

const POPULAR_HOSPITALS = [
  "Dhaka Medical College Hospital (DMCH)",
  "Square Hospital Ltd. (Panthapath)",
  "United Hospital (Gulshan)",
  "Evercare Hospital Dhaka (Bashundhara)",
  "NICVD (Sher-e-Bangla Nagar)",
  "Kurmitola General Hospital",
  "Closest Available Emergency Room",
];

const SEVERITY_LEVELS = [
  {
    priority: Priority.CRITICAL,
    label: "Critical / Resuscitation",
    desc: "Unconscious, cardiac arrest, stroke, severe trauma, choking",
    icon: Flame,
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/40 hover:border-rose-500",
    activeRing: "ring-2 ring-rose-500 bg-rose-500/15",
  },
  {
    priority: Priority.HIGH,
    label: "High Priority / Acute",
    desc: "Severe chest pain, heavy bleeding, difficulty breathing, major fracture",
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/40 hover:border-amber-500",
    activeRing: "ring-2 ring-amber-500 bg-amber-500/15",
  },
  {
    priority: Priority.MEDIUM,
    label: "Medium / Urgent Care",
    desc: "Persistent high fever, deep lacerations, asthma attack, severe abdominal pain",
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/40 hover:border-blue-500",
    activeRing: "ring-2 ring-blue-500 bg-blue-500/15",
  },
  {
    priority: Priority.LOW,
    label: "Standard / Medical Transfer",
    desc: "Scheduled hospital transfer, mild non-acute conditions, routine transport",
    icon: HeartPulse,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-500",
    activeRing: "ring-2 ring-emerald-500 bg-emerald-500/15",
  },
];

interface BookingWizardProps {
  initialDestination?: string;
}

export function EmergencyBookingWizard({
  initialDestination,
}: BookingWizardProps) {
  const router = useRouter();
  const createMutation = useCreateRequest();
  const [detectingGps, setDetectingGps] = useState(false);

  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    Priority.CRITICAL,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateEmergencyRequestInput>({
    resolver: zodResolver(createEmergencyRequestSchema),
    defaultValues: {
      priority: Priority.CRITICAL,
      pickupAddress: "",
      description: "",
      hospitalName: initialDestination || "Closest Available Emergency Room",
    },
  });

  // Geolocation auto-detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue("pickupLat", latitude);
        setValue("pickupLng", longitude);
        setValue(
          "pickupAddress",
          `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) — Dhaka Metropolitan Area`,
        );
        setDetectingGps(false);
        toast.success("GPS Coordinates calibrated accurately");
      },
      (err) => {
        setDetectingGps(false);
        toast.error(
          `Unable to retrieve GPS: ${err.message}. Please enter address manually.`,
        );
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleSelectQuickLocation = (loc: (typeof QUICK_LOCATIONS)[0]) => {
    setValue("pickupAddress", loc.name);
    setValue("pickupLat", loc.lat);
    setValue("pickupLng", loc.lng);
  };

  const onSubmit = (data: CreateEmergencyRequestInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push(ROUTES.PATIENT.DASHBOARD);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Real-time Triage Dispatch Banner */}
      <div className="rounded-xl border border-emergency/40 bg-emergency/10 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emergency text-white animate-pulse">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Emergency Dispatch Command Ready
            </h3>
            <p className="text-xs text-muted-foreground">
              Average Metropolitan Paramedic Response:{" "}
              <span className="font-semibold text-emergency font-mono">
                6 - 8 Minutes
              </span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Clock className="h-4 w-4 text-emerald-400" />
          <span>Active Units: 48 On Patrol</span>
        </div>
      </div>

      {/* Step 1: Severity Priority Selector */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Step 1: Patient Condition & Severity Level
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select the clinical urgency so dispatch matches the appropriate
            vehicle tier.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SEVERITY_LEVELS.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedPriority === level.priority;

            return (
              <button
                key={level.priority}
                type="button"
                onClick={() => {
                  setValue("priority", level.priority);
                  setSelectedPriority(level.priority);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer",
                  level.bg,
                  isSelected
                    ? level.activeRing
                    : "opacity-80 hover:opacity-100",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 shadow-xs",
                    level.color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-foreground">
                    {level.label}
                  </div>
                  <div className="text-3xs text-muted-foreground leading-normal mt-0.5">
                    {level.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.priority && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.priority.message}
          </p>
        )}
      </Card>

      {/* Step 2: Pickup Location */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
              Step 2: Patient Pickup Location
            </label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specify the street address, landmarks, or calibrate via GPS.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDetectGps}
            isLoading={detectingGps}
            leftIcon={<Crosshair className="h-3.5 w-3.5 text-primary" />}
          >
            Auto-Detect GPS
          </Button>
        </div>

        <Input
          placeholder="e.g. House 42, Road 9/A, Dhanmondi, Dhaka"
          leftIcon={<MapPin className="h-4 w-4" />}
          error={errors.pickupAddress?.message}
          disabled={createMutation.isPending}
          {...register("pickupAddress")}
        />

        {/* Quick select popular Dhaka hubs */}
        <div className="space-y-1.5">
          <span className="text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Select Location:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleSelectQuickLocation(loc)}
                className="rounded-md border border-border/70 bg-surface px-2.5 py-1 text-3xs font-medium text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Step 3: Destination Hospital & Symptoms */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Step 3: Clinical Notes & Preferred Hospital
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Provide symptoms to help paramedics prepare life-support equipment
            in advance.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground">
            Receiving Hospital
          </label>
          <div className="relative flex items-center">
            <Building2 className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <select
              className="w-full h-10 rounded-md border border-border bg-surface pl-10 pr-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...register("hospitalName")}
            >
              {POPULAR_HOSPITALS.map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground">
            Patient Symptoms & Critical Notes (Optional)
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g. 58-year-old male with sudden onset left-arm numbness and breathing tightness..."
              className="w-full rounded-md border border-border bg-surface p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              {...register("description")}
            />
          </div>
        </div>
      </Card>

      {/* Submit Action Button */}
      <Button
        type="submit"
        variant="emergency"
        size="lg"
        className="w-full py-4 text-base font-bold shadow-xl shadow-emergency/25 cursor-pointer"
        isLoading={createMutation.isPending}
        leftIcon={
          createMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )
        }
      >
        {createMutation.isPending
          ? "Dispatching Emergency Ambulance..."
          : "Confirm & Mobilize Nearest Ambulance"}
      </Button>
    </form>
  );
}
