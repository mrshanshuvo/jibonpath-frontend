import type { Metadata } from "next";
import Link from "next/link";
import { Ambulance, ShieldCheck, PhoneCall } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export const metadata: Metadata = {
  title: "Authentication | PulsePoint Dispatch",
  description:
    "Secure role-based access portal for PulsePoint Emergency Ambulance Dispatch.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-emergency selection:text-emergency-foreground">
      {/* Dynamic ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-full max-w-3xl rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      {/* Top minimal bar */}
      <header className="relative z-10 w-full border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={ROUTES.PUBLIC.HOME}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-150">
              <Ambulance className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                PulsePoint
              </span>
              <span className="text-3xs uppercase tracking-widest text-muted-foreground font-medium -mt-1">
                Emergency Dispatch Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium border border-border/60 bg-surface/50 rounded-full px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success-ink dark:text-success" />
              <span>TLS 256-Bit Encrypted</span>
            </div>

            <ThemeToggle />

            <a
              href="tel:999"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emergency/30 bg-emergency/10 text-emergency hover:bg-emergency/20 text-xs font-bold transition-all shadow-xs"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>999 Hotline</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main content centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">{children}</div>
      </main>

      {/* Bottom minimal footer */}
      <footer className="relative z-10 w-full border-t border-border/40 py-4 text-center text-3xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} PulsePoint Dispatch Systems. All
            rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.PUBLIC.ABOUT}
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href={ROUTES.PUBLIC.SERVICES}
              className="hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              href={ROUTES.PUBLIC.FAQ}
              className="hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
