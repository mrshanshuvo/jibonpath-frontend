"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Shield,
  Ambulance,
  HeartPulse,
  UserCheck,
  UserX,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Skeleton,
  Pagination,
  EmptyState,
  Input,
} from "@/components/ui";
import { Role } from "@/types/entities.types";
import {
  useAdminUsers,
  useUpdateUserRole,
  useToggleUserStatus,
  useDeleteUser,
} from "../api/admin.queries";
import { formatDateTime } from "@/lib/utils";

export function UserManagementTable() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit: 8,
    role: roleFilter,
    search: searchTerm.trim() || undefined,
  });

  const updateRoleMutation = useUpdateUserRole();
  const toggleStatusMutation = useToggleUserStatus();
  const deleteMutation = useDeleteUser();

  const handleRoleChange = (id: string, newRole: Role) => {
    updateRoleMutation.mutate({ id, role: newRole });
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to deactivate and remove account: ${name}?`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-3xs font-bold text-indigo-400 border border-indigo-500/20">
            <Shield className="h-3 w-3" />
            ADMIN
          </span>
        );
      case Role.DRIVER:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-3xs font-bold text-success border border-emerald-500/20">
            <Ambulance className="h-3 w-3" />
            DRIVER
          </span>
        );
      case Role.PATIENT:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-3xs font-bold text-blue-400 border border-blue-500/20">
            <HeartPulse className="h-3 w-3" />
            PATIENT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {["ALL", Role.PATIENT, Role.DRIVER, Role.ADMIN].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r as Role | "ALL");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                roleFilter === r
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised"
              }`}
            >
              {r === "ALL" ? "All Roles" : r}
            </button>
          ))}
        </div>

        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center gap-4"
              >
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              Failed to load user directory
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data?.users || data.users.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No Users Found"
              description="No user accounts match the current filter or search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-surface/50 text-3xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {data.users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          {u.name}
                        </span>
                        <span className="text-3xs font-mono text-muted-foreground">
                          {u.email}
                        </span>
                        {u.phone && (
                          <span className="text-3xs text-muted-foreground ml-2">
                            • {u.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as Role)
                          }
                          className="h-7 rounded border border-border bg-surface px-1.5 text-3xs font-medium text-foreground focus-visible:outline-none cursor-pointer"
                        >
                          <option value={Role.PATIENT}>PATIENT</option>
                          <option value={Role.DRIVER}>DRIVER</option>
                          <option value={Role.ADMIN}>ADMIN</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-semibold cursor-pointer border transition-colors ${
                          u.isActive
                            ? "bg-emerald-500/10 text-success border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-destructive/80 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 font-mono text-3xs text-muted-foreground">
                      {formatDateTime(u.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        title="Delete user"
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive/80 hover:bg-rose-400/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
    </div>
  );
}
