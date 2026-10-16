"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { User, Users, Search, X, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { type Driver } from "@/types/entities.types";
import { Skeleton, Pagination } from "@/components/shared";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export interface DriverPaginationConfig {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export interface DriverSelectorProps {
  drivers: Driver[];
  selectedDriverId: string;
  selectedDriver?: Driver | null;
  onSelectDriver: (id: string, driver?: Driver) => void;
  isLoading?: boolean;
  columns?: 2 | 3;
  search?: string;
  onSearchChange?: (val: string) => void;
  pagination?: DriverPaginationConfig;
  totalDriversCount?: number;
}

export function DriverSelector({
  drivers,
  selectedDriverId,
  selectedDriver,
  onSelectDriver,
  isLoading = false,
  columns = 2,
  search: controlledSearch,
  onSearchChange: controlledOnSearchChange,
  pagination,
  totalDriversCount,
}: DriverSelectorProps) {
  const [localSearch, setLocalSearch] = useState("");

  const isControlledSearch = controlledOnSearchChange !== undefined;
  const currentSearch = isControlledSearch
    ? (controlledSearch ?? "")
    : localSearch;

  const handleSearchChange = (val: string) => {
    if (isControlledSearch) {
      controlledOnSearchChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  const handleClearSearch = () => {
    handleSearchChange("");
  };

  // If search is handled on server (controlled), drivers is already filtered
  // Otherwise, filter in-memory as fallback
  const displayedDrivers = useMemo(() => {
    if (isControlledSearch) return drivers;
    if (!localSearch.trim()) return drivers;
    const q = localSearch.toLowerCase().trim();
    return drivers.filter((d) => {
      const name = d.user?.name || "";
      const email = d.user?.email || "";
      const phone = d.user?.phone || "";
      const license = d.licenseNumber || "";
      return (
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        phone.toLowerCase().includes(q) ||
        license.toLowerCase().includes(q)
      );
    });
  }, [drivers, isControlledSearch, localSearch]);

  const gridColsClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  const totalCount =
    pagination?.total ?? totalDriversCount ?? displayedDrivers.length;

  const isSelectedDriverOffPage =
    selectedDriver &&
    selectedDriverId &&
    !displayedDrivers.some((d) => d.id === selectedDriverId);

  return (
    <div className="space-y-3">
      {/* Header with Title and Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span>Select Certified Driver ({totalCount} On Standby)</span>
        </label>

        {/* Driver Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search name, email, or license..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              aria-label="Clear driver search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned active selection if selected driver is on a different page or hidden by search */}
      {isSelectedDriverOffPage && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">Selected from other page:</span>
            <span className="font-bold text-foreground truncate">
              {selectedDriver.user?.name || "Selected Driver"}
            </span>
            <span className="font-mono text-primary bg-primary/15 px-1.5 py-0.5 rounded text-[11px]">
              BRTA: {selectedDriver.licenseNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectDriver("")}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Grid or Empty/Loading State */}
      {isLoading ? (
        <div className={cn("grid gap-2.5", gridColsClass)}>
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : displayedDrivers.length === 0 ? (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 text-sm space-y-2">
          <div className="flex items-center gap-2 text-warning-ink dark:text-warning font-bold">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>No Matching Drivers Found</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentSearch
              ? `No standby drivers match "${currentSearch}". Try searching by name, email, or BRTA license number.`
              : "There are no on-duty paramedic drivers available on standby for deployment."}
          </p>
          {currentSearch ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Clear search
            </button>
          ) : (
            <Link
              href={ROUTES.ADMIN.DRIVERS}
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              Go to Paramedic Drivers &rarr;
            </Link>
          )}
        </div>
      ) : (
        <div className={cn("grid gap-2.5", gridColsClass)}>
          {displayedDrivers.map((drv) => {
            const isSelected = selectedDriverId === drv.id;
            return (
              <button
                key={drv.id}
                type="button"
                onClick={() => onSelectDriver(drv.id, drv)}
                className={cn(
                  "text-left p-3 rounded-xl border transition-all cursor-pointer relative",
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                    : "border-border/80 bg-surface/60 hover:bg-surface-raised hover:border-border",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-bold text-sm sm:text-base text-foreground truncate">
                        {drv.user?.name || "Paramedic Driver"}
                      </span>
                    </div>
                    <div className="flex flex-col text-xs font-mono text-muted-foreground">
                      <span>BRTA: {drv.licenseNumber}</span>
                      {drv.user?.email && (
                        <span className="text-xs text-muted-foreground/80 truncate" title={drv.user.email}>
                          {drv.user.email}
                        </span>
                      )}
                      {drv.user?.phone && (
                        <span className="text-xs text-primary font-medium">
                          Tel: {drv.user.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-border/80" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={pagination.onPageChange}
          className="pt-1 border-t border-border/30"
        />
      )}
    </div>
  );
}
