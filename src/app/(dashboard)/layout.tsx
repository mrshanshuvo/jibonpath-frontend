"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar, UserMenu } from "@/components/layout";
import { Button, ThemeToggle } from "@/components/shared";
import { Menu, X, PhoneCall, Radio } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Helper to format breadcrumb from pathname
  const getBreadcrumbTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    if (parts.length === 1) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} Portal`;
    }
    return parts
      .map(
        (part) =>
          part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      )
      .join(" / ");
  };

  return (
    <div className="h-dvh flex overflow-hidden bg-background text-foreground">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <DashboardSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in-0 duration-200">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-surface shadow-2xl h-full flex flex-col">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DashboardSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="shrink-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm text-foreground">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            {/* Real-time telemetry status indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-success/25 bg-success-tint px-3 py-1 text-3xs font-medium text-success-ink dark:text-success">
              <Radio className="h-3 w-3" />
              <span>DISPATCH TELEMETRY ONLINE</span>
            </div>

            <a
              href="tel:999"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-emergency/30 bg-emergency/10 text-danger-ink dark:text-emergency hover:bg-emergency/20 text-xs font-bold transition-all shadow-xs"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>999 Hotline</span>
            </a>

            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
