import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { ROUTES } from "@/config/routes";
import {
  Ambulance,
  PhoneCall,
  ShieldAlert,
  Clock,
  MapPin,
  HeartPulse,
  CreditCard,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-border/60">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-emergency/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="emergency" pulse dot size="md">
              24/7 Rapid Emergency Response Active
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            Every Second Counts.{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-rose-500 to-amber-500">
              Instant Emergency Ambulance Dispatch.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            GPS telemetry routing, certified paramedic response, and real-time
            hospital coordination. Deployed with sub-minute dispatch times.
          </p>

          {/* Main Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={ROUTES.patient.book} className="w-full sm:w-auto">
              <Button
                variant="emergency"
                size="lg"
                className="w-full sm:w-auto shadow-xl"
                leftIcon={<ShieldAlert className="h-5 w-5" />}
              >
                Book Emergency Ambulance Now
              </Button>
            </Link>

            <Link href={ROUTES.login} className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                1-Click Demo Portals
              </Button>
            </Link>

            <a href="tel:999" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-emergency/40 text-emergency hover:bg-emergency/10"
                leftIcon={<PhoneCall className="h-4 w-4 animate-bounce" />}
              >
                Direct 999 Hotline
              </Button>
            </a>
          </div>

          {/* Key Service Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Basic, ALS & ICU Ambulances</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Live GPS Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Instant bKash, SSLCommerz & Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <section className="border-b border-border/60 bg-surface/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-foreground">8.2 min</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Average Response Time
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-success">100%</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Licensed Paramedics
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-primary">50+</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Hospitals Connected
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-foreground">
                24/7/365
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Continuous Operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 CORE PILLARS */}
      <section className="py-20 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="default" size="sm">
              Next-Gen Dispatch Network
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Engineered for High-Stakes Critical Care
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Seamless coordination connecting emergency callers, mobile
              paramedic units, and hospital trauma centers in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card
              glass
              className="hover:border-slate-600 transition-all duration-200"
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emergency/15 text-emergency mb-4">
                  <Ambulance className="h-6 w-6" />
                </div>
                <CardTitle>Rapid Smart Dispatch</CardTitle>
                <CardDescription>
                  Automated proximity matching dispatches the closest available
                  ALS, BLS, or Intensive Care unit within seconds of call
                  intake.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Instant automated driver alert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>Live coordinate guidance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card
              glass
              className="hover:border-slate-600 transition-all duration-200"
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/15 text-success mb-4">
                  <Building2 className="h-6 w-6" />
                </div>
                <CardTitle>Hospital Telemetry Handshake</CardTitle>
                <CardDescription>
                  Emergency doctors receive live patient vitals and triage
                  status prior to ambulance arrival at the emergency room.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <HeartPulse className="h-3.5 w-3.5 text-success" />
                    <span>Pre-arrival trauma bed preparation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span>Direct capacity status verification</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card
              glass
              className="hover:border-slate-600 transition-all duration-200"
            >
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <CardTitle>Transparent Healthcare Billing</CardTitle>
                <CardDescription>
                  Standardized, fair pricing with instant digital receipting via
                  Stripe, bKash, and SSLCommerz gateways.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>No surprise surge fees or hidden costs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>Automated digital payment confirmation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* DEMO EVALUATION BANNER */}
      <section className="py-16 bg-linear-to-b from-surface to-background border-b border-border/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-xl space-y-6">
            <Badge variant="warning" size="md">
              Evaluation Access Available
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Test All 3 System Roles with 1-Click Demo Login
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Instantly switch between System Admin command, Paramedic Driver
              live transit mode, and Patient emergency booking without manual
              signups.
            </p>
            <div className="pt-2">
              <Link href={ROUTES.login}>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Open 1-Click Demo Login Grid
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
