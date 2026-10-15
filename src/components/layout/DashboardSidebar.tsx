"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/stores/auth.store";
import { ROUTES } from "@/config/routes";
import { Role, RequestStatus } from "@/types/entities.types";
import { cn } from "@/lib/utils";
import { JibonPathLogo } from "@/components/brand";
import { useAdminRequests } from "@/features/emergency";
import {
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  User as UserIcon,
  Navigation,
  History,
  TrendingUp,
  Truck,
  Users,
  Radio,
  FileText,
  Activity,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const PATIENT_NAV: NavItem[] = [
  { href: ROUTES.PATIENT.DASHBOARD, label: "My Requests", icon: Activity },
  { href: ROUTES.PATIENT.BOOK, label: "Book Ambulance", icon: PlusCircle },
  { href: ROUTES.PATIENT.PAYMENTS, label: "Payment History", icon: CreditCard },
  { href: ROUTES.PATIENT.PROFILE, label: "My Profile", icon: UserIcon },
];

const DRIVER_NAV: NavItem[] = [
  { href: ROUTES.DRIVER.DASHBOARD, label: "Active Dispatch", icon: Navigation },
  { href: ROUTES.DRIVER.HISTORY, label: "Trip History", icon: History },
  { href: ROUTES.DRIVER.EARNINGS, label: "Earnings & Stats", icon: TrendingUp },
  { href: ROUTES.DRIVER.PROFILE, label: "Driver Profile", icon: UserIcon },
];

const ADMIN_NAV: NavItem[] = [
  {
    href: ROUTES.ADMIN.DASHBOARD,
    label: "Analytics Overview",
    icon: LayoutDashboard,
  },
  { href: ROUTES.ADMIN.FLEET, label: "Fleet Management", icon: Truck },
  { href: ROUTES.ADMIN.DRIVERS, label: "Paramedic Drivers", icon: Users },
  { href: ROUTES.ADMIN.DISPATCHES, label: "Active Dispatches", icon: Radio },
  { href: ROUTES.ADMIN.USERS, label: "User Directory", icon: Users },
  { href: ROUTES.ADMIN.LOGS, label: "Audit Logs", icon: FileText },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAuthUser();

  const isAdmin = user?.role === Role.ADMIN;
  const { data: pendingData } = useAdminRequests(
    { status: RequestStatus.PENDING, limit: 50 },
    { enabled: isAdmin },
  );
  const pendingCount = isAdmin ? (pendingData?.requests?.length ?? 0) : 0;

  const navItems: NavItem[] =
    user?.role === Role.ADMIN
      ? ADMIN_NAV
      : user?.role === Role.DRIVER
        ? DRIVER_NAV
        : PATIENT_NAV;

  const roleTitle =
    user?.role === Role.ADMIN
      ? "Command Console"
      : user?.role === Role.DRIVER
        ? "Paramedic Portal"
        : "Patient Portal";

  return (
    <aside className="w-64 h-full border-r border-border bg-surface shrink-0 flex flex-col">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-border/80">
        <JibonPathLogo
          size="sm"
          showTagline={true}
          tagline={roleTitle}
          href={
            user?.role === Role.ADMIN
              ? ROUTES.ADMIN.DASHBOARD
              : user?.role === Role.DRIVER
                ? ROUTES.DRIVER.DASHBOARD
                : ROUTES.PATIENT.DASHBOARD
          }
        />
      </div>

      {/* Nav List */}
      <div className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isDispatchesNav = item.href === ROUTES.ADMIN.DISPATCHES;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-raised",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground",
                )}
              />
              <span className="flex-1">{item.label}</span>

              {/* Live Incident Alert Badge */}
              {isDispatchesNav && pendingCount > 0 && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-3xs font-extrabold shadow-xs",
                    isActive
                      ? "bg-emergency text-emergency-foreground animate-pulse"
                      : "bg-emergency/20 text-danger-ink dark:text-emergency animate-pulse",
                  )}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Emergency Banner */}
      <div className="p-4 border-t border-border/80">
        <div className="rounded-lg bg-emergency/10 border border-emergency/20 p-3 text-center">
          <p className="text-2xs font-bold text-danger-ink dark:text-emergency">
            Direct Dispatch Line
          </p>
          <p className="text-xs font-bold text-foreground mt-0.5">
            999 Hotline
          </p>
        </div>
      </div>
    </aside>
  );
}
