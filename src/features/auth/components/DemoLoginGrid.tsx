"use client";

import { useState } from "react";
import {
  Shield,
  Ambulance,
  HeartPulse,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/config/demo-credentials";
import { Role } from "@/types/entities.types";
import { useLogin } from "../api/auth.queries";
import { cn } from "@/lib/utils";

interface DemoLoginGridProps {
  onSelectAccount?: (account: DemoAccount) => void;
}

export function DemoLoginGrid({ onSelectAccount }: DemoLoginGridProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const loginMutation = useLogin();

  const handleQuickLogin = (account: DemoAccount) => {
    setSelectedRole(account.role);
    if (onSelectAccount) {
      onSelectAccount(account);
    }
    loginMutation.mutate({
      email: account.email,
      password: account.password,
    });
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Shield className="h-5 w-5 text-primary" />;
      case Role.DRIVER:
        return (
          <Ambulance className="h-5 w-5 text-success-ink dark:text-success" />
        );
      case Role.PATIENT:
        return <HeartPulse className="h-5 w-5 text-emergency" />;
    }
  };

  const getRoleAccent = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "border-primary/25 hover:border-primary/50 hover:bg-primary/5";
      case Role.DRIVER:
        return "border-success/25 hover:border-success/50 hover:bg-success/5";
      case Role.PATIENT:
        return "border-emergency/25 hover:border-emergency/50 hover:bg-emergency/5";
    }
  };

  const getBadgeStyle = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-primary/10 text-primary border-primary/20";
      case Role.DRIVER:
        return "bg-success-tint text-success-ink dark:text-success border-success/20";
      case Role.PATIENT:
        return "bg-danger-tint text-danger-ink dark:text-emergency border-emergency/20";
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          One-Click Demo Credentials
        </h3>
        <span className="text-xs rounded-full bg-muted/70 px-2.5 py-0.5 font-mono text-muted-foreground border border-border/40">
          Instant Switch
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => {
          const isCurrentLoading =
            loginMutation.isPending && selectedRole === account.role;

          return (
            <button
              key={account.role}
              type="button"
              disabled={loginMutation.isPending}
              onClick={() => handleQuickLogin(account)}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border p-4 sm:p-4.5 text-left transition-all duration-200 cursor-pointer",
                "bg-card/75 hover:bg-card hover:shadow-lg backdrop-blur-sm",
                getRoleAccent(account.role),
                isCurrentLoading &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
                loginMutation.isPending &&
                  !isCurrentLoading &&
                  "opacity-60 cursor-not-allowed",
              )}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/90 border border-border/50 shadow-xs">
                    {getRoleIcon(account.role)}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold rounded-full border px-2.5 py-0.5 whitespace-nowrap shrink-0",
                      getBadgeStyle(account.role),
                    )}
                  >
                    {account.badge}
                  </span>
                </div>

                <div className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                  {account.name}
                </div>
                <div
                  className="mt-1 font-mono text-xs text-muted-foreground select-all break-all group-hover:text-foreground/90 transition-colors"
                  title={account.email}
                >
                  {account.email}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-2.5 gap-2 w-full">
                <span className="font-mono text-xs text-muted-foreground/90 bg-muted/50 px-2 py-0.5 rounded border border-border/40 select-all shrink-0">
                  {account.password}
                </span>
                <div className="flex items-center text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap shrink-0">
                  {isCurrentLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      Sign in
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
