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
        return <Shield className="h-5 w-5 text-indigo-400" />;
      case Role.DRIVER:
        return <Ambulance className="h-5 w-5 text-success" />;
      case Role.PATIENT:
        return <HeartPulse className="h-5 w-5 text-emergency" />;
    }
  };

  const getRoleAccent = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-950/20";
      case Role.DRIVER:
        return "border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/20";
      case Role.PATIENT:
        return "border-emergency/30 hover:border-emergency/60 hover:bg-emergency/10";
    }
  };

  const getBadgeStyle = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case Role.DRIVER:
        return "bg-emerald-500/10 text-success border-emerald-500/20";
      case Role.PATIENT:
        return "bg-emergency/10 text-emergency border-emergency/20";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          One-Click Demo Credentials
        </h3>
        <span className="text-3xs rounded bg-muted/60 px-1.5 py-0.5 font-mono text-muted-foreground">
          Instant Switch
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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
                "group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200",
                "bg-card/60 backdrop-blur-sm",
                getRoleAccent(account.role),
                isCurrentLoading &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
                loginMutation.isPending &&
                  !isCurrentLoading &&
                  "opacity-60 cursor-not-allowed",
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 border border-border/40 shadow-xs">
                    {getRoleIcon(account.role)}
                  </div>
                  <span
                    className={cn(
                      "text-3xs font-medium rounded-full border px-2 py-0.5",
                      getBadgeStyle(account.role),
                    )}
                  >
                    {account.badge}
                  </span>
                </div>

                <div className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">
                  {account.name}
                </div>
                <div className="mt-0.5 font-mono text-3xs text-muted-foreground truncate">
                  {account.email}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2">
                <span className="text-3xs text-muted-foreground font-mono">
                  {account.password}
                </span>
                <div className="flex items-center text-3xs font-medium text-muted-foreground group-hover:text-foreground">
                  {isCurrentLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  ) : (
                    <span className="flex items-center gap-1">
                      Sign in{" "}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
