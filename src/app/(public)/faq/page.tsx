"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useUrlParams } from "@/hooks/useUrlParams";
import { ChevronDown, HelpCircle, PhoneCall, ArrowRight } from "lucide-react";
import { Button } from "@/components/shared";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Emergency Dispatch",
    question:
      "How does PulsePoint achieve under 10-minute metropolitan response times?",
    answer:
      "Our system uses intelligent geo-spatial routing that tracks real-time traffic density, driver availability, and vehicle proximity. When a request is triggered, our dispatch engine assigns the closest suitable ambulance and provides turn-by-turn routing with Dhaka traffic congestion avoidance.",
  },
  {
    category: "Emergency Dispatch",
    question:
      "Can I request an emergency ambulance on behalf of a family member or third party?",
    answer:
      "Yes. In the booking flow, you can specify the exact patient pickup address and GPS coordinates, contact phone number, and clinical condition. You will receive live GPS telemetry tracking of the dispatched ambulance directly on your device.",
  },
  {
    category: "Fleet & Medical Care",
    question: "What is the difference between BLS, ACLS, and ICU ambulances?",
    answer:
      "Basic Life Support (BLS) is equipped with oxygen cylinders, AEDs, and fracture immobilization gear for stable patients. Advanced Cardiac Life Support (ACLS) adds 12-lead ECG monitors, defibrillators, and emergency airway intubation equipment for acute cardiac/stroke cases. Intensive Care (ICU) is a mobile ICU with invasive mechanical ventilators, multi-channel infusion pumps, and an accompanying critical care medical officer.",
  },
  {
    category: "Fleet & Medical Care",
    question: "Are your paramedic crews certified in critical resuscitation?",
    answer:
      "Every paramedic on our roster is certified in BLS, ACLS, and PALS protocols with mandatory recurrent simulation training conducted at accredited medical training centers in Dhaka.",
  },
  {
    category: "Pricing & Payments",
    question: "How are ambulance fares calculated?",
    answer:
      "Fares are calculated based on transparent base charges matching the vehicle tier (Basic: ৳1,500, ACLS: ৳3,500, ICU: ৳6,000) plus an official distance-based rate (৳45-85 per kilometer). All fares include oxygen administration and paramedic monitoring with no hidden emergency surcharges.",
  },
  {
    category: "Pricing & Payments",
    question: "What payment gateways are supported?",
    answer:
      "We support multi-gateway instant digital settlements via bKash, SSLCommerz (all local Bangladeshi debit/credit cards and mobile wallets), and Stripe (international cards). Patients and callers receive an official downloadable digital tax invoice upon payment completion.",
  },
  {
    category: "Hospital Coordination",
    question: "Does PulsePoint notify the receiving hospital before arrival?",
    answer:
      "Yes. Once a destination hospital is confirmed, our pre-arrival telemetry system transmits patient vitals, oxygen saturation, and estimated time of arrival (ETA) directly to the emergency department, ensuring trauma teams are scrubbed and prepared at the emergency bay.",
  },
  {
    category: "Hospital Coordination",
    question: "Can I choose which hospital the patient is transported to?",
    answer:
      "Absolutely. You can select any government or private hospital in Dhaka during booking, or consult with our dispatch physician who can recommend facilities with confirmed ICU and cath lab availability.",
  },
];

function FaqContent() {
  const { params, setParams } = useUrlParams();
  const [openIndices, setOpenIndices] = useState<number[]>([0, 2]);

  const categories = [
    "ALL",
    "Emergency Dispatch",
    "Fleet & Medical Care",
    "Pricing & Payments",
    "Hospital Coordination",
  ];

  const rawCategory = params.get("category");
  const selectedCategory =
    rawCategory && categories.includes(rawCategory) ? rawCategory : "ALL";

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const filteredFaqs = FAQS.filter(
    (faq) => selectedCategory === "ALL" || faq.category === selectedCategory,
  );

  return (
    <div className="flex flex-col">
      {/* Hero Header */}
      <section className="py-16 sm:py-20 border-b border-border/60 bg-surface">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-2xs font-semibold text-primary mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Operational FAQ & Guidelines</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about our response protocol, vehicle
            capabilities, pricing transparency, and emergency hospital
            handovers.
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 border-b border-border/60 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setParams({
                  category: cat === "ALL" ? "" : cat,
                });
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
              )}
            >
              {cat === "ALL" ? "All Questions" : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Accordion List */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndices.includes(idx);

            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-raised/40 transition-colors"
                >
                  <div className="pr-4">
                    <span className="text-3xs font-semibold uppercase tracking-wider text-primary">
                      {faq.category}
                    </span>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground mt-1">
                      {faq.question}
                    </h2>
                  </div>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-foreground",
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-border/40 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-50 duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Need more help banner */}
      <section className="py-12 border-t border-border/60 bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Have an unanswered question?
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Our 24/7 central dispatchers and customer care teams are available
              around the clock.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:999">
              <Button
                variant="emergency"
                leftIcon={<PhoneCall className="h-4 w-4" />}
              >
                Call 999 Hotline
              </Button>
            </a>
            <Link href={ROUTES.PUBLIC.CONTACT}>
              <Button
                variant="outline"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Contact Operations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FaqPage() {
  return (
    <Suspense>
      <FaqContent />
    </Suspense>
  );
}
