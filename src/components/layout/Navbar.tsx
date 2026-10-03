"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/Button";
import { Ambulance, PhoneCall, Menu, X, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: ROUTES.PUBLIC.HOME, label: "Home" },
  { href: ROUTES.PUBLIC.SERVICES, label: "Services" },
  { href: ROUTES.PUBLIC.HOSPITALS, label: "Hospitals" },
  { href: ROUTES.PUBLIC.ABOUT, label: "About" },
  { href: ROUTES.PUBLIC.FAQ, label: "FAQ" },
  { href: ROUTES.PUBLIC.CONTACT, label: "Contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href={ROUTES.PUBLIC.HOME}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emergency text-white shadow-md shadow-emergency/30 group-hover:scale-105 transition-transform duration-150">
            <Ambulance className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              PulsePoint
              <span className="flex h-2 w-2 rounded-full bg-emergency animate-ping" />
            </span>
            <span className="text-3xs uppercase tracking-widest text-muted-foreground font-medium -mt-1">
              Ambulance Dispatch
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  isActive
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA + UserMenu */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="tel:999"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emergency/30 bg-emergency/10 text-emergency hover:bg-emergency/20 text-xs font-bold transition-all shadow-sm shadow-emergency/20"
          >
            <PhoneCall className="h-3.5 w-3.5 animate-bounce" />
            <span>999 Hotline</span>
          </a>

          <UserMenu />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-raised",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border">
            <a
              href="tel:999"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emergency text-white text-sm font-bold shadow-md shadow-emergency/30"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Call 999 Hotline Now</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
