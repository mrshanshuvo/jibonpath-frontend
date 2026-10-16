"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Building2,
  PhoneCall,
  MapPin,
  Bed,
  Search,
  CheckCircle,
  ShieldCheck,
  Ambulance,
} from "lucide-react";
import { Input, Button, Badge } from "@/components/shared";
import { ROUTES } from "@/config/routes";

interface HospitalItem {
  id: string;
  name: string;
  zone: string;
  address: string;
  phone: string;
  traumaLevel: string;
  icuBeds: number;
  hasCathLab: boolean;
  hasBurnUnit: boolean;
}

const DHAKA_HOSPITALS: HospitalItem[] = [
  {
    id: "hosp-1",
    name: "Dhaka Medical College Hospital (DMCH)",
    zone: "Old Dhaka / Ramna",
    address: "Secretariat Road, Ramna, Dhaka 1000",
    phone: "+880255165088",
    traumaLevel: "Level 1 Trauma Center",
    icuBeds: 45,
    hasCathLab: true,
    hasBurnUnit: true,
  },
  {
    id: "hosp-2",
    name: "Square Hospital Ltd.",
    zone: "Panthapath / Dhanmondi",
    address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, Panthapath, Dhaka 1205",
    phone: "10616",
    traumaLevel: "Level 1 Comprehensive Care",
    icuBeds: 38,
    hasCathLab: true,
    hasBurnUnit: false,
  },
  {
    id: "hosp-3",
    name: "Evercare Hospital Dhaka",
    zone: "Bashundhara R/A",
    address: "Plot 81, Block E, Bashundhara R/A, Dhaka 1229",
    phone: "10678",
    traumaLevel: "Level 1 JCI Accredited",
    icuBeds: 50,
    hasCathLab: true,
    hasBurnUnit: false,
  },
  {
    id: "hosp-4",
    name: "United Hospital Limited",
    zone: "Gulshan 2",
    address: "Plot 15, Road 71, Gulshan 2, Dhaka 1212",
    phone: "10666",
    traumaLevel: "Cardiac & Stroke Specialty",
    icuBeds: 40,
    hasCathLab: true,
    hasBurnUnit: false,
  },
  {
    id: "hosp-5",
    name: "National Institute of Cardiovascular Diseases (NICVD)",
    zone: "Sher-e-Bangla Nagar",
    address: "Mirpur Road, Sher-e-Bangla Nagar, Dhaka 1207",
    phone: "+88029122560",
    traumaLevel: "National Cardiac Trauma Emergency",
    icuBeds: 35,
    hasCathLab: true,
    hasBurnUnit: false,
  },
  {
    id: "hosp-6",
    name: "Kurmitola General Hospital",
    zone: "Dhaka Cantonment",
    address: "Airport Road, Cantonment, Dhaka 1206",
    phone: "+880255067200",
    traumaLevel: "Level 2 Armed Forces Emergency",
    icuBeds: 24,
    hasCathLab: false,
    hasBurnUnit: false,
  },
  {
    id: "hosp-7",
    name: "BIRDEM General Hospital",
    zone: "Shahbagh",
    address: "122 Kazi Nazrul Islam Ave, Shahbagh, Dhaka 1000",
    phone: "10614",
    traumaLevel: "Endocrine & Multi-Organ Trauma",
    icuBeds: 30,
    hasCathLab: true,
    hasBurnUnit: false,
  },
  {
    id: "hosp-8",
    name: "National Institute of Traumatology (NITOR - Pongu)",
    zone: "Sher-e-Bangla Nagar",
    address: "Sher-e-Bangla Nagar, Shyamoli, Dhaka 1207",
    phone: "+88029114075",
    traumaLevel: "Apex Orthopedic & Polytrauma",
    icuBeds: 20,
    hasCathLab: false,
    hasBurnUnit: false,
  },
];

const ZONES = [
  "ALL",
  "Old Dhaka / Ramna",
  "Panthapath / Dhanmondi",
  "Bashundhara R/A",
  "Gulshan 2",
  "Sher-e-Bangla Nagar",
  "Dhaka Cantonment",
  "Shahbagh",
];

function HospitalsContent() {
  const { params, setParams } = useUrlParams();

  const urlSearch = params.get("search") ?? "";
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchTerm, 350);

  const rawZone = params.get("zone");
  const selectedZone = rawZone && ZONES.includes(rawZone) ? rawZone : "ALL";

  useEffect(() => {
    if (debouncedSearch !== (params.get("search") ?? "")) {
      setParams({
        search: debouncedSearch.trim() || "",
      });
    }
  }, [debouncedSearch, params, setParams]);

  const filteredHospitals = useMemo(() => {
    return DHAKA_HOSPITALS.filter((hosp) => {
      const matchesSearch =
        hosp.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        hosp.address.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesZone = selectedZone === "ALL" || hosp.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [debouncedSearch, selectedZone]);

  return (
    <div className="flex flex-col">
      {/* Header Banner */}
      <section className="py-16 border-b border-border/60 bg-surface">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="default" className="mb-4">
            Dhaka Emergency Medical Network
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Partner Hospitals & Trauma Centers
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Real-time ER reception coordination with tertiary facilities across
            Dhaka. Our ambulances stream patient vitals ahead for zero-delay
            triage admission.
          </p>
        </div>
      </section>

      {/* Search & Zone Filters */}
      <section className="py-8 border-b border-border/60 bg-surface/30">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <Input
                placeholder="Search hospital by name, area, or road..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {ZONES.map((zone) => (
                <button
                  key={zone}
                  onClick={() => {
                    setParams({
                      zone: zone === "ALL" ? "" : zone,
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedZone === zone
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised"
                  }`}
                >
                  {zone === "ALL" ? "All Zones" : zone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Directory Cards */}
      <section className="py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:border-primary/40 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {hospital.zone}
                      </span>
                      <h3 className="text-lg font-bold text-foreground mt-0.5">
                        {hospital.name}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="shrink-0 font-medium">
                      {hospital.traumaLevel}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <span>{hospital.address}</span>
                  </div>

                  {/* Badges for Capabilities */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-xs border border-border/50 text-foreground font-medium">
                      <Bed className="h-3.5 w-3.5 text-primary" />
                      <span>{hospital.icuBeds} Critical ICU Beds</span>
                    </div>

                    {hospital.hasCathLab && (
                      <div className="flex items-center gap-1.5 rounded-md bg-danger-tint text-danger-ink dark:text-danger px-2.5 py-1 text-xs font-semibold border border-danger/20">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>24/7 Cath Lab (Cardiac)</span>
                      </div>
                    )}

                    {hospital.hasBurnUnit && (
                      <div className="flex items-center gap-1.5 rounded-md bg-warning-tint text-warning-ink dark:text-warning px-2.5 py-1 text-xs font-semibold border border-warning/20">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Burn & Plastic Trauma Unit</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4 mt-2">
                  <a
                    href={`tel:${hospital.phone}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-success-ink dark:text-success" />
                    <span>ER Line: {hospital.phone}</span>
                  </a>

                  <Link
                    href={`${ROUTES.PATIENT.BOOK}?destination=${encodeURIComponent(hospital.name)}`}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<Ambulance className="h-3.5 w-3.5" />}
                    >
                      Route Here
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredHospitals.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground" />
              <h4 className="mt-3 text-base font-semibold text-foreground">
                No matching hospitals found
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching with a different hospital name or clear the zone
                filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Bottom Section */}
      <section className="py-12 border-t border-border/60 bg-surface">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold text-foreground">
            Direct Hospital Pre-Arrival Notification
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            When you request an ambulance via JibonPath, the destination
            hospital receives live telemetry and estimated arrival time,
            ensuring the ER trauma team is scrubbed and prepared at the bay.
          </p>
          <div className="mt-6">
            <Link href={ROUTES.PATIENT.BOOK}>
              <Button variant="emergency" size="lg">
                Book Immediate Emergency Transit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HospitalsPage() {
  return (
    <Suspense>
      <HospitalsContent />
    </Suspense>
  );
}
