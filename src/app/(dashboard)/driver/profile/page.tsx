"use client";

import { useAuthUser } from "@/stores/auth.store";
import { Card, Badge } from "@/components/ui";
import { Phone, CreditCard, Shield, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function DriverProfilePage() {
  const user = useAuthUser();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Paramedic Driver Credential Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Verified medical first-responder certification and BRTA heavy
          commercial license validation.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-success font-bold text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <Badge variant="warning" size="sm">
                PARAMEDIC DRIVER
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-3xs text-success font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Active on Dhaka Duty Rotation
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-surface p-4 border border-border/60 space-y-1">
            <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              BRTA Heavy License
            </span>
            <p className="font-mono font-bold text-foreground text-sm">
              BRTA-DHAKA-2022-7718
            </p>
            <span className="text-3xs text-success font-medium">
              Verified & Active
            </span>
          </div>

          <div className="rounded-xl bg-surface p-4 border border-border/60 space-y-1">
            <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emergency" />
              Medical Certifications
            </span>
            <p className="font-bold text-foreground text-sm">
              ACLS / BLS / Trauma Resuscitation
            </p>
            <span className="text-3xs text-muted-foreground font-mono">
              Issued by DGHS Dhaka
            </span>
          </div>

          <div className="rounded-xl bg-surface p-4 border border-border/60 space-y-1">
            <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Direct Emergency Hotline
            </span>
            <p className="font-mono font-bold text-foreground text-sm">
              {user.phone || "01700000002"}
            </p>
          </div>

          <div className="rounded-xl bg-surface p-4 border border-border/60 space-y-1">
            <span className="text-3xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Account Commissioned
            </span>
            <p className="font-mono text-xs text-foreground">
              {formatDateTime(user.createdAt)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
