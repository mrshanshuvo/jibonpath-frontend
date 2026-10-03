import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { Ambulance, Phone, MapPin, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface/80 text-muted-foreground mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emergency text-white">
                <Ambulance className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-foreground">
                PulsePoint
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Critical care emergency ambulance dispatch and hospital telemetry
              tracking network operating 24 hours, 7 days a week.
            </p>
            <div className="flex items-center gap-2 text-xs text-success font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>Emergency Network Online</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Patient Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href={ROUTES.PATIENT.BOOK}
                  className="hover:text-foreground transition-colors"
                >
                  Book Emergency Ambulance
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PUBLIC.HOSPITALS}
                  className="hover:text-foreground transition-colors"
                >
                  Hospital Directory
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PUBLIC.SERVICES}
                  className="hover:text-foreground transition-colors"
                >
                  Life Support Categories
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PUBLIC.FAQ}
                  className="hover:text-foreground transition-colors"
                >
                  Emergency FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Access Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href={ROUTES.DRIVER.DASHBOARD}
                  className="hover:text-foreground transition-colors"
                >
                  Paramedic Driver Portal
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ADMIN.DASHBOARD}
                  className="hover:text-foreground transition-colors"
                >
                  Admin Dispatch Command
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.AUTH.LOGIN}
                  className="hover:text-foreground transition-colors"
                >
                  Demo One-Click Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Emergency Contact
            </h4>
            <div className="flex items-center gap-2.5 text-xs">
              <Phone className="h-4 w-4 text-emergency shrink-0" />
              <span className="text-foreground font-semibold">
                999 / +880 1700-000001
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>dispatch@pulsepoint.dev</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>Dhaka Central Emergency Command Center, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 PulsePoint Operations. All rights reserved.</p>
          <div className="flex items-center gap-2 text-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>ISO 9001:2015 Emergency Healthcare Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
