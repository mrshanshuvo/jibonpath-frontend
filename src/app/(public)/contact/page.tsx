"use client";

import { useState } from "react";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success(
        "Inquiry received. Our dispatch liaison will respond promptly.",
      );
    }, 1000);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Header */}
      <section className="py-16 sm:py-20 border-b border-border/60 bg-gradient-to-b from-card/50 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emergency/30 bg-emergency/10 px-3.5 py-1 text-2xs font-semibold text-emergency mb-4">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>24/7 Central Command & Control</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Contact Dispatch Operations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Immediate phone hotlines for medical emergencies, hospital
            coordination, and corporate standby agreements.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Direct Emergency Contact Cards */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Immediate Emergency Hotlines
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  For active medical crisis, dial directly for priority
                  ambulance allocation.
                </p>
              </div>

              {/* Emergency Highlight Card */}
              <div className="rounded-2xl border border-emergency/40 bg-emergency/10 p-6 sm:p-8 backdrop-blur-sm shadow-lg shadow-emergency/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emergency text-white">
                    <PhoneCall className="h-6 w-6 animate-bounce" />
                  </div>
                  <span className="text-3xs font-mono font-bold uppercase rounded-full bg-emergency text-white px-3 py-1">
                    Zero Delay
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-emergency uppercase tracking-wider">
                    National Emergency Triage Line
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground mt-1">
                    999
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct integration with Dhaka emergency triage and traffic
                    siren corridor.
                  </p>
                </div>
                <a
                  href="tel:999"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emergency py-3 text-sm font-bold text-white hover:bg-emergency/90 transition-all shadow-md shadow-emergency/30"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call 999 Hotline Now</span>
                </a>
              </div>

              {/* Secondary Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    Control Center
                  </div>
                  <div className="font-mono text-xs text-primary font-medium">
                    +880 1700-000999
                  </div>
                  <p className="text-3xs text-muted-foreground">
                    Direct dispatcher switchboard
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-5 space-y-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    Hospital Liaison
                  </div>
                  <div className="font-mono text-xs text-primary font-medium">
                    liaison@pulsepoint.dev
                  </div>
                  <p className="text-3xs text-muted-foreground">
                    Inter-facility transfer desk
                  </p>
                </div>
              </div>

              {/* Physical Address */}
              <div className="rounded-xl border border-border/80 bg-surface/50 p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-raised border border-border text-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    Central Command Headquarters
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Level 4, Medical Telematics Tower, Mohakhali C/A, Dhaka
                    1212, Bangladesh
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-3xs text-muted-foreground">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    <span>
                      Control Room: 24 Hours / 7 Days / 365 Days continuous
                      operations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* General Inquiry / Corporate Contact Form */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-bold text-foreground">
                Inquiry & Corporate Standby Desk
              </h3>
              <p className="text-xs text-muted-foreground mt-1 mb-6">
                Have questions regarding hospital integration, fleet deployment,
                or event standby?
              </p>

              {submitted ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-foreground">
                    Message Dispatched Successfully
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Our operations manager will review your submission and
                    contact you within 2 business hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                    className="mt-2"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      placeholder="e.g. Dr. Kazi Rahman"
                      required
                    />
                    <Input
                      label="Contact Phone"
                      type="tel"
                      placeholder="017XXXXXXXX"
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@domain.com"
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Inquiry Category
                    </label>
                    <select
                      className="w-full h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      defaultValue="GENERAL"
                    >
                      <option value="GENERAL">
                        General Operational Inquiry
                      </option>
                      <option value="HOSPITAL">
                        Hospital Admission & Telemetry Integration
                      </option>
                      <option value="CORPORATE">
                        Corporate & Industrial Event Medical Standby
                      </option>
                      <option value="FEEDBACK">
                        Patient Experience & Quality Feedback
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Message Details
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please specify location requirements, patient requirements, or inquiry specifics..."
                      className="w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
