import type { Metadata } from "next";
import Link from "next/link";
import {
  Baby,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button, Badge } from "@/components/shared";
import { ROUTES } from "@/config/routes";
import { AmbulanceType } from "@/types/entities.types";

export const metadata: Metadata = {
  title: "Emergency Medical Fleet & Specialized Services",
  description:
    "Comprehensive pre-hospital emergency medical services: Basic Life Support, ACLS Cardiac, and Mobile Intensive Care Units (MICU) in Dhaka.",
  openGraph: {
    title: "Emergency Medical Fleet & Specialized Services | JibonPath",
    description:
      "Comprehensive pre-hospital emergency medical services: Basic Life Support, ACLS Cardiac, and Mobile Intensive Care Units (MICU) in Dhaka.",
  },
};

const FLEET_TIERS = [
  {
    type: AmbulanceType.BASIC,
    title: "Basic Life Support (BLS)",
    badge: "Non-Critical & Minor Trauma",
    badgeVariant: "secondary" as const,
    pricing: "From ৳ 1,500 base + ৳ 45/km",
    description:
      "Designed for hemodynamically stable patients requiring non-invasive airway support, fracture immobilization, or routine medical transport.",
    equipment: [
      "Portable Medical Oxygen (2000L manifold)",
      "Automated External Defibrillator (AED)",
      "Spine Board, Cervical Collars & Splints",
      "Sphygmomanometer & Pulse Oximeter",
      "Emergency First Responder & Driver Crew",
    ],
    idealFor:
      "Post-surgery discharges, orthopedic fractures, mild respiratory distress.",
  },
  {
    type: AmbulanceType.ADVANCED_LIFE_SUPPORT,
    title: "Advanced Cardiac Life Support (ACLS)",
    badge: "Acute Cardiac & Severe Trauma",
    badgeVariant: "warning" as const,
    pricing: "From ৳ 3,500 base + ৳ 65/km",
    description:
      "Full mobile cardiac emergency unit with advanced hemodynamic monitoring, emergency intubation capabilities, and ACLS-certified paramedics.",
    equipment: [
      "12-Lead Diagnostic ECG & Pacing Defibrillator",
      "Direct Laryngoscope & Endotracheal Intubation Kit",
      "Emergency Cardiac Resuscitation Medications",
      "Dual-Channel Syringe Infusion Pump",
      "Senior Critical Care Paramedic + Emergency Driver",
    ],
    idealFor:
      "Myocardial infarction (Heart Attack), acute stroke, polytrauma, severe hemorrhage.",
  },
  {
    type: AmbulanceType.INTENSIVE_CARE,
    title: "Intensive Care Unit (ICU / MICU)",
    badge: "Critical Ventilator Support",
    badgeVariant: "emergency" as const,
    pricing: "From ৳ 6,000 base + ৳ 85/km",
    description:
      "A complete tertiary ICU bay on wheels. Outfitted with invasive mechanical ventilation, multi-parameter arterial line monitoring, and specialized physician accompaniment.",
    equipment: [
      "Transport Mechanical Ventilator (SIMV, BiPAP, CPAP)",
      "Multi-Parameter Vitals Monitor (Invasive BP, EtCO2)",
      "Continuous Suction & High-Flow Oxygen System",
      "Four-Channel Precision Infusion System",
      "Critical Care Specialist Physician + ICU Nurse Crew",
    ],
    idealFor:
      "Comatose patients, intubated respiratory failure, multi-organ failure transfers.",
  },
];

const SPECIALIZED_SERVICES = [
  {
    icon: Baby,
    title: "Neonatal & Pediatric Critical Transport",
    description:
      "Specialized temperature-controlled transport incubators, micro-infusion pumps, and pediatric ventilators managed by neonatal resuscitation certified teams.",
  },
  {
    icon: Building,
    title: "Inter-Hospital Critical Transfers",
    description:
      "Seamless bedside-to-bedside patient handover across metropolitan Dhaka and regional tertiary medical centers with zero telemetry disruption.",
  },
  {
    icon: ShieldCheck,
    title: "Corporate & Event Medical Standby",
    description:
      "Dedicated onsite ambulance teams with medical triage stations for industrial zones, sports tournaments, embassies, and public gatherings.",
  },
];

const TIER_TYPE_LABELS: Record<AmbulanceType, string> = {
  [AmbulanceType.BASIC]: "BLS Tier",
  [AmbulanceType.ADVANCED_LIFE_SUPPORT]: "ACLS Tier",
  [AmbulanceType.INTENSIVE_CARE]: "ICU / MICU Tier",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      {/* Header Banner */}
      <section className="py-16 sm:py-20 border-b border-border/60 bg-surface">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="emergency" className="mb-4">
            Tiered Emergency Response Fleet
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Precision Emergency Transport Services
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Every clinical emergency requires matched equipment and specialized
            crews. Select the appropriate emergency tier for immediate GPS
            dispatch.
          </p>
        </div>
      </section>

      {/* Fleet Tiers Grid */}
      <section className="py-16 sm:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {FLEET_TIERS.map((tier) => (
              <div
                key={tier.type}
                className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-lg hover:border-primary/50 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <Badge variant={tier.badgeVariant}>{tier.badge}</Badge>
                    <span className="font-sans text-2xs font-bold tracking-wider text-muted-foreground uppercase">
                      {TIER_TYPE_LABELS[tier.type]}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-foreground">
                    {tier.title}
                  </h2>
                  <div className="mt-2 font-heading text-base font-extrabold text-primary tabular-nums tracking-tight">
                    {tier.pricing}
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mt-6 border-t border-border/60 pt-4">
                    <h3 className="text-3xs font-bold uppercase tracking-wider text-foreground mb-3">
                      Onboard Medical Equipment:
                    </h3>
                    <ul className="space-y-2">
                      {tier.equipment.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 rounded-lg bg-surface p-3 border border-border/40">
                    <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Recommended For:
                    </span>
                    <p className="text-xs text-foreground mt-0.5 font-medium">
                      {tier.idealFor}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border/60">
                  <Link
                    href={`${ROUTES.PATIENT.BOOK}?tier=${tier.type}`}
                    className="w-full block"
                  >
                    <Button
                      variant={
                        tier.type === AmbulanceType.INTENSIVE_CARE
                          ? "emergency"
                          : "primary"
                      }
                      className="w-full justify-center"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Request {tier.title.split("(")[0]}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Services */}
      <section className="py-16 border-t border-border/60 bg-surface/30">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Beyond Emergency Dispatch
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Specialized Medical Logistics & Escort
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SPECIALIZED_SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-3"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-base text-foreground">
                    {service.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Assurance Banner */}
      <section className="py-12 border-t border-border/60 bg-card">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                24/7 Rapid Emergency Response Desk
              </h4>
              <p className="text-xs text-muted-foreground">
                All units are monitored in real-time by Dhaka Central Emergency
                Control.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:999">
              <Button variant="emergency" size="lg">
                Call 999 Emergency
              </Button>
            </a>
            <Link href={ROUTES.PATIENT.BOOK}>
              <Button variant="primary" size="lg">
                Online Dispatch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
