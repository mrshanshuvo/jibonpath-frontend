"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
} from "@/stores/auth.store";
import { ROLE_DEFAULT_REDIRECT } from "@/config/roles";
import { ROUTES } from "@/config/routes";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
      clearAuth();
      toast.success("Logged out successfully");
      window.location.replace(ROUTES.AUTH.LOGIN);
    } catch {
      clearAuth();
      window.location.replace(ROUTES.AUTH.LOGIN);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link href={ROUTES.AUTH.LOGIN}>
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href={ROUTES.AUTH.REGISTER}>
          <Button variant="emergency" size="sm">
            Emergency Call
          </Button>
        </Link>
      </div>
    );
  }

  const dashboardRoute = ROLE_DEFAULT_REDIRECT[user.role] || ROUTES.PUBLIC.HOME;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-border bg-surface-raised hover:border-slate-600 transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
          {getInitials(user.name)}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight text-foreground max-w-28 truncate">
            {user.name}
          </span>
          <span className="text-3xs text-muted-foreground leading-tight">
            {user.role}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground mr-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
          <div className="px-3 py-2 border-b border-border/70 mb-1">
            <p className="text-xs font-semibold text-foreground truncate">
              {user.name}
            </p>
            <p className="text-2xs text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="mt-1.5">
              <Badge
                variant={
                  user.role === "ADMIN"
                    ? "emergency"
                    : user.role === "DRIVER"
                      ? "warning"
                      : "default"
                }
                size="sm"
              >
                {user.role} PORTAL
              </Badge>
            </div>
          </div>

          <Link
            href={dashboardRoute}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-md hover:bg-surface-raised transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span>Dashboard</span>
          </Link>

          <Link
            href={`${dashboardRoute}/profile`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-md hover:bg-surface-raised transition-colors"
          >
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span>Profile Settings</span>
          </Link>

          <div className="border-t border-border/70 my-1" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
