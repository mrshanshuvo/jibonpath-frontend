import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldAlert,
  Clock,
  HeartPulse,
  Activity,
  Award,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/shared";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "About Our Emergency Dispatch Network",
  description:
    "Learn how JibonPath coordinates rapid ambulance dispatch, specialized paramedic teams, and hospital telemetry across Dhaka.",
  openGraph: {
    title: "About Our Emergency Dispatch Network | JibonPath",
    description:
      "Learn how JibonPath coordinates rapid ambulance dispatch, specialized paramedic teams, and hospital telemetry across Dhaka.",
  },
};

const METRICS = [
  { value: "< 8.5 min", label: "Average Metropolitan Response Time" },
  { value: "48+", label: "ICU & ACLS Ambulances in Active Rotation" },
  { value: "99.8%", label: "Live Telemetry Dispatch Uptime" },
  { value: "14,200+", label: "Critical Patients Safely Transported" },
];

const VALUES = [
  {
    icon: Clock,
    title: "Golden Hour Protocol",
    description:
      "Every emergency procedure is strictly calibrated to deliver critical trauma, stroke, and cardiac patients to destination ERs within the clinical golden hour.",
  },
  {
    icon: Activity,
    title: "Real-Time Telemetry Streaming",
    description:
      "Paramedics stream ECG readings, SpO2 levels, and vitals directly to receiving emergency physicians while in transit, enabling immediate surgical readiness.",
  },
  {
    icon: HeartPulse,
    title: "Triple-Tier Medical Fleet",
    description:
      "From Basic Life Support (BLS) to mobile ICU units equipped with mechanical ventilators and dual-channel infusion pumps, we match patient acuity precisely.",
  },
  {
    icon: ShieldAlert,
    title: "Rigorous Paramedic Certification",
    description:
      "All drivers and response medics undergo BLS/ACLS/PALS certification with bi-annual high-fidelity trauma simulation training.",
  },
];

const LEADERSHIP = [
  {
    name: "Dr. Rafiqul Islam, MD, FCCP",
    role: "Chief Medical Officer",
    department: "Emergency Medicine & Critical Care",
    bio: "Former Head of Emergency Triage at Dhaka Medical College Hospital with 22 years of clinical trauma oversight.",
  },
  {
    name: "Engr. Tanvir Mahmud",
    role: "Director of Fleet & Telematics",
    department: "Automotive Systems & IoT",
    bio: "Architected Bangladesh's first GPS-synchronized real-time emergency routing and siren corridor integration.",
  },
  {
    name: "Farhana Chowdhury, RN, CEN",
    role: "Director of Paramedic Operations",
    department: "Emergency Nursing Standards",
    bio: "Over 15 years leading frontline resuscitation crews and disaster mitigation deployment teams.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border/60 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-2xs font-semibold text-primary mb-6 shadow-xs">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Dhaka Emergency Medical Operations</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
              Reinventing Pre-Hospital Care in Bangladesh
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              JibonPath was founded with a singular, uncompromising mission: to
              eliminate preventable transit delays during acute medical crises.
              By bridging automated dispatch algorithms with certified paramedic
              crews, we ensure immediate intervention when seconds decide life.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={ROUTES.PATIENT.BOOK}>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<HeartPulse className="h-4 w-4" />}
                >
                  Dispatch Ambulance Now
                </Button>
              </Link>
              <Link href={ROUTES.PUBLIC.HOSPITALS}>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Building2 className="h-4 w-4" />}
                >
                  View Partner Hospitals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real Metrics Banner */}
      <section className="border-b border-border/60 bg-surface/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {METRICS.map((metric, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-foreground">
                  {metric.value}
                </span>
                <span className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Operational Values */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Clinical Quality & Safety Standards
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built Upon Uncompromised Medical Standards
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Every ambulance dispatch adheres to internationally accredited
              trauma management protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm hover:border-border transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-5">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-semibold text-foreground mb-2">
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Medical Governance & Leadership */}
      <section className="py-16 border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Medical Governance
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Physician-Led Operational Command
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Our clinical leadership guarantees continuous quality oversight,
              strict protocol enforcement, and rapid triage coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {LEADERSHIP.map((leader, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm space-y-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emergency/10 border border-emergency/20 text-emergency">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-foreground">
                    {leader.name}
                  </h4>
                  <p className="text-xs font-medium text-primary mt-0.5">
                    {leader.role}
                  </p>
                  <p className="text-3xs text-muted-foreground uppercase tracking-wider mt-0.5">
                    {leader.department}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                  {leader.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Facing a Life-Threatening Situation?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Our dispatch algorithms instantly mobilize the closest available
            BLS, ACLS, or ICU unit with live GPS route tracking.
          </p>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <a
              href="tel:999"
              className="inline-flex items-center gap-2 rounded-lg bg-emergency px-6 py-3 text-sm font-bold text-emergency-foreground shadow-lg shadow-emergency/30 hover:bg-emergency/90 transition-all"
            >
              <span>Call 999 Hotline</span>
            </a>
            <Link href={ROUTES.PATIENT.BOOK}>
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Book Ambulance Online
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
