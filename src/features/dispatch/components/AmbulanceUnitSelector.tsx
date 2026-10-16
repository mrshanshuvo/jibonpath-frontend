"use client";

import { useMemo, useState } from "react";
import {
  Ambulance as AmbulanceIcon,
  Search,
  X,
  Truck,
  Siren,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { AmbulanceType, type Ambulance } from "@/types/entities.types";
import { Badge, Skeleton, Pagination } from "@/components/shared";
import { cn } from "@/lib/utils";

export const AMBULANCE_TYPE_LABELS: Record<
  AmbulanceType,
  { label: string; badgeClass: string }
> = {
  [AmbulanceType.BASIC]: {
    label: "BLS • Basic Life Support",
    badgeClass: "bg-surface text-muted-foreground border-border",
  },
  [AmbulanceType.ADVANCED_LIFE_SUPPORT]: {
    label: "ACLS • Advanced Life Support",
    badgeClass: "bg-info/10 text-info-ink dark:text-info border-info/30",
  },
  [AmbulanceType.INTENSIVE_CARE]: {
    label: "ICU • Mobile Intensive Care",
    badgeClass:
      "bg-emergency/10 text-danger-ink dark:text-emergency border-emergency/30",
  },
};

export interface AmbulancePaginationConfig {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export interface AmbulanceUnitSelectorProps {
  ambulances: Ambulance[];
  selectedAmbulanceId: string;
  selectedAmbulance?: Ambulance | null;
  onSelectAmbulance: (id: string, ambulance?: Ambulance) => void;
  isCritical?: boolean;
  isHigh?: boolean;
  isLoading?: boolean;
  columns?: 2 | 3;
  search?: string;
  onSearchChange?: (val: string) => void;
  filterType?: "ALL" | AmbulanceType;
  onFilterTypeChange?: (type: "ALL" | AmbulanceType) => void;
  pagination?: AmbulancePaginationConfig;
  totalAmbulancesCount?: number;
  icuCount?: number;
  aclsCount?: number;
  blsCount?: number;
}

export function AmbulanceUnitSelector({
  ambulances,
  selectedAmbulanceId,
  selectedAmbulance,
  onSelectAmbulance,
  isCritical = false,
  isHigh = false,
  isLoading = false,
  columns = 2,
  search: controlledSearch,
  onSearchChange: controlledOnSearchChange,
  filterType: controlledFilterType,
  onFilterTypeChange: controlledOnFilterTypeChange,
  pagination,
  totalAmbulancesCount,
  icuCount: customIcuCount,
  aclsCount: customAclsCount,
  blsCount: customBlsCount,
}: AmbulanceUnitSelectorProps) {
  const [localFilter, setLocalFilter] = useState<"ALL" | AmbulanceType>("ALL");
  const [localSearch, setLocalSearch] = useState("");

  const isControlledSearch = controlledOnSearchChange !== undefined;
  const currentSearch = isControlledSearch
    ? (controlledSearch ?? "")
    : localSearch;

  const isControlledFilter = controlledOnFilterTypeChange !== undefined;
  const currentFilter = isControlledFilter
    ? (controlledFilterType ?? "ALL")
    : localFilter;

  const handleSearchChange = (val: string) => {
    if (isControlledSearch) {
      controlledOnSearchChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  const handleFilterChange = (type: "ALL" | AmbulanceType) => {
    if (isControlledFilter) {
      controlledOnFilterTypeChange(type);
    } else {
      setLocalFilter(type);
    }
  };

  const handleClearSearch = () => {
    handleSearchChange("");
  };

  // Counts
  const icuCount =
    customIcuCount ??
    ambulances.filter((a) => a.type === AmbulanceType.INTENSIVE_CARE).length;
  const aclsCount =
    customAclsCount ??
    ambulances.filter((a) => a.type === AmbulanceType.ADVANCED_LIFE_SUPPORT)
      .length;
  const blsCount =
    customBlsCount ??
    ambulances.filter((a) => a.type === AmbulanceType.BASIC).length;

  // Filter items in memory if not controlled by server query
  const displayedAmbulances = useMemo(() => {
    if (isControlledSearch && isControlledFilter) return ambulances;
    return ambulances.filter((a) => {
      const matchesFilter = currentFilter === "ALL" || a.type === currentFilter;
      if (!matchesFilter) return false;
      if (!currentSearch.trim()) return true;
      const q = currentSearch.toLowerCase().trim();
      return (
        a.vehicleNumber?.toLowerCase().includes(q) ||
        (a.make && a.make.toLowerCase().includes(q)) ||
        a.type?.toLowerCase().includes(q)
      );
    });
  }, [
    ambulances,
    currentFilter,
    currentSearch,
    isControlledFilter,
    isControlledSearch,
  ]);

  const gridColsClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  const totalCount =
    pagination?.total ?? totalAmbulancesCount ?? displayedAmbulances.length;

  const isSelectedAmbulanceOffPage =
    selectedAmbulance &&
    selectedAmbulanceId &&
    !displayedAmbulances.some((a) => a.id === selectedAmbulanceId);

  return (
    <div className="space-y-3">
      {/* Header with Title and Recommendation Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <span>Select Ambulance Unit ({totalCount} Active in Dhaka)</span>
        </label>

        {(isCritical || isHigh) && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emergency font-bold bg-emergency/10 border border-emergency/30 px-2.5 py-1 rounded-full shrink-0">
            <Siren className="h-3.5 w-3.5 animate-pulse" />
            ICU/ACLS Recommended
          </span>
        )}
      </div>

      {/* Filter Pills & Live Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap",
              currentFilter === "ALL"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
            )}
          >
            All{" "}
            {pagination && currentFilter === "ALL"
              ? `(${totalCount})`
              : `(${ambulances.length})`}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange(AmbulanceType.INTENSIVE_CARE)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap",
              currentFilter === AmbulanceType.INTENSIVE_CARE
                ? "bg-emergency text-emergency-foreground border-emergency shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
            )}
          >
            ICU {icuCount > 0 ? `(${icuCount})` : ""}
          </button>
          <button
            type="button"
            onClick={() =>
              handleFilterChange(AmbulanceType.ADVANCED_LIFE_SUPPORT)
            }
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap",
              currentFilter === AmbulanceType.ADVANCED_LIFE_SUPPORT
                ? "bg-info text-info-foreground border-info shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
            )}
          >
            ACLS {aclsCount > 0 ? `(${aclsCount})` : ""}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange(AmbulanceType.BASIC)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer whitespace-nowrap",
              currentFilter === AmbulanceType.BASIC
                ? "bg-secondary text-secondary-foreground border-secondary shadow-xs"
                : "bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised",
            )}
          >
            BLS {blsCount > 0 ? `(${blsCount})` : ""}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search vehicle number or model..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
              aria-label="Clear ambulance search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned active selection if selected ambulance is on a different page or hidden by filter */}
      {isSelectedAmbulanceOffPage && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              Selected from other page:
            </span>
            <span className="font-mono font-bold text-foreground">
              {selectedAmbulance.vehicleNumber}
            </span>
            <span className="text-xs text-primary bg-primary/15 px-2 py-0.5 rounded font-medium">
              {AMBULANCE_TYPE_LABELS[selectedAmbulance.type]?.label ||
                selectedAmbulance.type}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectAmbulance("")}
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
      ) : displayedAmbulances.length === 0 ? (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 text-sm space-y-2">
          <div className="flex items-center gap-2 text-warning-ink dark:text-warning font-bold">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>No Matching Ambulances Found</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {currentSearch
              ? `No units match "${currentSearch}". Try clearing the search or switching filters.`
              : "No available units match the selected tier filter. Switch to All to review the full fleet."}
          </p>
          {currentSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className={cn("grid gap-2.5", gridColsClass)}>
          {displayedAmbulances.map((amb) => {
            const isSelected = selectedAmbulanceId === amb.id;
            const typeInfo = AMBULANCE_TYPE_LABELS[amb.type] || {
              label: amb.type,
              badgeClass: "bg-surface text-muted-foreground",
            };
            const isRecommended =
              (isCritical && amb.type === AmbulanceType.INTENSIVE_CARE) ||
              (isHigh && amb.type === AmbulanceType.ADVANCED_LIFE_SUPPORT);

            return (
              <button
                key={amb.id}
                type="button"
                onClick={() => onSelectAmbulance(amb.id, amb)}
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
                      <AmbulanceIcon className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-mono font-bold text-sm sm:text-base text-foreground truncate">
                        {amb.vehicleNumber}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "inline-block text-xs font-semibold px-2 py-0.5 rounded-md border",
                        typeInfo.badgeClass,
                      )}
                    >
                      {typeInfo.label}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-border/80" />
                    )}
                    {isRecommended && !isSelected && (
                      <Badge variant="default" size="sm" className="text-xs">
                        Match
                      </Badge>
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
