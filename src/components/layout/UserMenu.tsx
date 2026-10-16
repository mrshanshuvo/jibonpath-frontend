"use client";

import Link from "next/link";
import {
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
} from "@/stores/auth.store";
import { ROLE_DEFAULT_REDIRECT } from "@/config/roles";
import { ROUTES } from "@/config/routes";
import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui";
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const clearAuth = useAuthStore((state) => state.clearAuth);

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
          <Button variant="primary" size="sm">
            Book Ambulance
          </Button>
        </Link>
      </div>
    );
  }

  const dashboardRoute = ROLE_DEFAULT_REDIRECT[user.role] || ROUTES.PUBLIC.HOME;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full border border-border bg-surface-raised hover:border-border-hover transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="User navigation menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
          {getInitials(user.name)}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-semibold leading-tight text-foreground max-w-32 truncate">
            {user.name}
          </span>
          <span className="text-xs font-medium text-muted-foreground leading-tight">
            {user.role}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground mr-1" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
        <DropdownMenuLabel className="px-3 py-2 border-b border-border/70 mb-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="mt-1.5">
            <Badge
              variant={
                user.role === "ADMIN"
                  ? "info"
                  : user.role === "DRIVER"
                    ? "warning"
                    : "default"
              }
              size="sm"
            >
              {user.role} PORTAL
            </Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuItem
          render={
            <Link
              href={dashboardRoute}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-md transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span>Dashboard</span>
            </Link>
          }
        />

        <DropdownMenuItem
          render={
            <Link
              href={`${dashboardRoute}/profile`}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-md transition-colors"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>Profile Settings</span>
            </Link>
          }
        />

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
