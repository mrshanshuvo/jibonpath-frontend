"use client";

import { Users, MapPin, Building2, FileText } from "lucide-react";
import { type EmergencyRequest } from "@/types/entities.types";
import { parseRequestDescription } from "@/features/emergency/components/RequestCard";

export interface IncidentDossierCardProps {
  request: EmergencyRequest;
  className?: string;
}

export function IncidentDossierCard({
  request,
  className,
}: IncidentDossierCardProps) {
  const parsed = parseRequestDescription(request.description);
  const contactPhone = parsed.phone || request.caller?.phone;

  return (
    <div
      className={
        className ||
        "rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm"
      }
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span>Patient & Incident Dossier</span>
      </h2>

      <div className="space-y-3.5 text-sm">
        {/* Patient / Caller info */}
        <div className="flex items-start gap-3 bg-surface/50 p-3 rounded-xl border border-border/40">
          <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
              Patient / Caller
            </span>
            <span className="font-semibold text-sm text-foreground">
              {request.caller?.name || "Caller In Distress"}
            </span>
            {contactPhone && (
              <span className="text-xs font-mono text-muted-foreground block">
                Tel: {contactPhone}
              </span>
            )}
          </div>
        </div>

        {/* Emergency Pickup Location */}
        <div className="flex items-start gap-3 bg-surface/50 p-3 rounded-xl border border-border/40">
          <MapPin className="h-4 w-4 text-emergency shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
              Emergency Pickup Location
            </span>
            <span className="font-semibold text-sm text-foreground wrap-break-word leading-relaxed">
              {request.pickupAddress}
            </span>
          </div>
        </div>

        {/* Destination Hospital Bay */}
        {parsed.hospital && (
          <div className="flex items-start gap-3 bg-surface/50 p-3 rounded-xl border border-border/40">
            <Building2 className="h-4 w-4 text-info shrink-0 mt-0.5" />
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground block font-bold">
                Destination Hospital Bay
              </span>
              <span className="font-semibold text-sm text-foreground">
                {parsed.hospital}
              </span>
            </div>
          </div>
        )}

        {/* Triage Condition & Clinical Notes */}
        {parsed.notes && (
          <div className="p-3.5 rounded-xl border border-emergency/25 bg-emergency/5 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-danger-ink dark:text-emergency block">
              Triage Symptoms & Clinical Condition
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {parsed.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
