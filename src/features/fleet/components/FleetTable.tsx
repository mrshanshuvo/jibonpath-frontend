"use client";

import { useState } from "react";
import {
  Ambulance,
  Plus,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Badge,
  Skeleton,
  Pagination,
  EmptyState,
} from "@/components/ui";
import { AmbulanceFormModal } from "./AmbulanceFormModal";
import {
  AmbulanceStatus,
  AmbulanceType,
  type Ambulance as AmbulanceModel,
} from "@/types/entities.types";
import {
  useAmbulances,
  useUpdateAmbulance,
  useDeleteAmbulance,
} from "../api/fleet.queries";
import { formatDateTime } from "@/lib/utils";

export function FleetTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AmbulanceStatus | "ALL">(
    "ALL",
  );
  const [typeFilter, setTypeFilter] = useState<AmbulanceType | "ALL">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAmbulance, setEditingAmbulance] =
    useState<AmbulanceModel | null>(null);

  const { data, isLoading, isError, refetch } = useAmbulances({
    page,
    limit: 8,
    status: statusFilter,
    type: typeFilter,
  });

  const updateMutation = useUpdateAmbulance();
  const deleteMutation = useDeleteAmbulance();

  const handleEdit = (item: AmbulanceModel) => {
    setEditingAmbulance(item);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAmbulance(null);
    setModalOpen(true);
  };

  const handleQuickStatusChange = (id: string, newStatus: AmbulanceStatus) => {
    updateMutation.mutate({ id, input: { status: newStatus } });
  };

  const handleDelete = (id: string, reg: string) => {
    if (confirm(`Are you sure you want to remove vehicle ${reg} from fleet?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: AmbulanceStatus) => {
    switch (status) {
      case AmbulanceStatus.AVAILABLE:
        return (
          <Badge variant="success" size="sm" dot>
            AVAILABLE
          </Badge>
        );
      case AmbulanceStatus.DISPATCHED:
        return (
          <Badge variant="emergency" size="sm" pulse>
            DISPATCHED
          </Badge>
        );
      case AmbulanceStatus.MAINTENANCE:
        return (
          <Badge variant="warning" size="sm">
            MAINTENANCE
          </Badge>
        );
      case AmbulanceStatus.RETIRED:
        return (
          <Badge variant="outline" size="sm">
            RETIRED
          </Badge>
        );
    }
  };

  const getTypeBadge = (type: AmbulanceType) => {
    switch (type) {
      case AmbulanceType.BASIC:
        return (
          <span className="text-3xs font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            BLS (Basic)
          </span>
        );
      case AmbulanceType.ADVANCED_LIFE_SUPPORT:
        return (
          <span className="text-3xs font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ACLS (Cardiac)
          </span>
        );
      case AmbulanceType.INTENSIVE_CARE:
        return (
          <span className="text-3xs font-medium px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ICU (Ventilator)
          </span>
        );
    }
  };

  const statuses: Array<AmbulanceStatus | "ALL"> = [
    "ALL",
    AmbulanceStatus.AVAILABLE,
    AmbulanceStatus.DISPATCHED,
    AmbulanceStatus.MAINTENANCE,
    AmbulanceStatus.RETIRED,
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised"
              }`}
            >
              {status === "ALL" ? "All Status" : status}
            </button>
          ))}

          <div className="hidden sm:block h-4 w-px bg-border/80 mx-1" />

          {/* Tier filters */}
          {[
            "ALL",
            AmbulanceType.BASIC,
            AmbulanceType.ADVANCED_LIFE_SUPPORT,
            AmbulanceType.INTENSIVE_CARE,
          ].map((type) => (
            <button
              key={type}
              onClick={() => {
                setTypeFilter(type as AmbulanceType | "ALL");
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-3xs font-medium transition-colors cursor-pointer ${
                typeFilter === type
                  ? "bg-foreground text-background font-bold"
                  : "bg-surface/50 border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {type === "ALL"
                ? "All Tiers"
                : type === AmbulanceType.BASIC
                  ? "BLS"
                  : type === AmbulanceType.ADVANCED_LIFE_SUPPORT
                    ? "ACLS"
                    : "ICU"}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleCreate}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Ambulance
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4"
              >
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              Failed to load fleet data
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data?.ambulances || data.ambulances.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Ambulance}
              title="No Fleet Ambulances Found"
              description="No ambulances match the active filter criteria."
              actionLabel="Add New Ambulance"
              onAction={handleCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-surface/50 text-3xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Registration & Vehicle</th>
                  <th className="px-5 py-3.5">Equipment Tier</th>
                  <th className="px-5 py-3.5">Rotation Status</th>
                  <th className="px-5 py-3.5">Assigned Driver</th>
                  <th className="px-5 py-3.5">Last Inspection</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {data.ambulances.map((amb) => (
                  <tr
                    key={amb.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface border border-border">
                          <Ambulance className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm font-mono block text-foreground">
                            {amb.vehicleNumber}
                          </span>
                          <span className="text-3xs text-muted-foreground">
                            {amb.make || "Toyota HiAce Emergency"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">{getTypeBadge(amb.type)}</td>

                    <td className="px-5 py-4">{getStatusBadge(amb.status)}</td>

                    <td className="px-5 py-4">
                      {amb.driver?.user ? (
                        <div className="text-xs">
                          <span className="font-medium text-foreground block">
                            {amb.driver.user.name}
                          </span>
                          <span className="text-3xs font-mono text-muted-foreground">
                            Lic: {amb.driver.licenseNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xs text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-3xs font-mono text-muted-foreground">
                      {formatDateTime(amb.updatedAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {amb.status !== AmbulanceStatus.MAINTENANCE && (
                          <button
                            title="Mark for Maintenance"
                            onClick={() =>
                              handleQuickStatusChange(
                                amb.id,
                                AmbulanceStatus.MAINTENANCE,
                              )
                            }
                            className="p-1.5 rounded-md text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {amb.status === AmbulanceStatus.MAINTENANCE && (
                          <button
                            title="Mark Available"
                            onClick={() =>
                              handleQuickStatusChange(
                                amb.id,
                                AmbulanceStatus.AVAILABLE,
                              )
                            }
                            className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}

                        <button
                          title="Edit vehicle details"
                          onClick={() => handleEdit(amb)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          title="Decommission vehicle"
                          onClick={() =>
                            handleDelete(amb.id, amb.vehicleNumber)
                          }
                          className="p-1.5 rounded-md text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && data?.meta && data.meta.totalPages > 1 && (
          <div className="p-4 border-t border-border/60 flex justify-center">
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Ambulance Modal */}
      <AmbulanceFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        ambulance={editingAmbulance}
      />
    </div>
  );
}
