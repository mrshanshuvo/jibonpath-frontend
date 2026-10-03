"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Ambulance,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Badge,
  Skeleton,
  EmptyState,
  Pagination,
} from "@/components/ui";
import { DriverOnboardingModal, useAdminUsers } from "@/features/admin";
import { Role } from "@/types/entities.types";
import { formatDateTime } from "@/lib/utils";

export default function AdminDriversPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit: 8,
    role: Role.DRIVER,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Paramedic Drivers Roster
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Commission certified drivers, manage BRTA heavy licenses, and verify
            emergency first-responder credentials.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Commission Driver
        </Button>
      </div>

      {/* Driver List Cards / Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center gap-4"
              >
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              Failed to load driver roster
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data?.users || data.users.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No Paramedic Drivers Registered"
              description="No drivers found on the system roster."
              actionLabel="Commission First Driver"
              onAction={() => setModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-surface/50 text-3xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Driver & Contact</th>
                  <th className="px-5 py-3.5">Role Authorization</th>
                  <th className="px-5 py-3.5">Operational Status</th>
                  <th className="px-5 py-3.5">Commissioned Date</th>
                  <th className="px-5 py-3.5 text-right">Emergency Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {data.users.map((driver) => (
                  <tr
                    key={driver.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-success border border-emerald-500/20">
                          <Ambulance className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground block">
                            {driver.name}
                          </span>
                          <span className="text-3xs font-mono text-muted-foreground">
                            {driver.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant="warning" size="sm">
                        PARAMEDIC DRIVER
                      </Badge>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-semibold bg-emerald-500/10 text-success border border-emerald-500/20">
                        <CheckCircle className="h-3 w-3" />
                        Active on Patrol
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-3xs text-muted-foreground">
                      {formatDateTime(driver.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {driver.phone ? (
                        <a
                          href={`tel:${driver.phone}`}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{driver.phone}</span>
                        </a>
                      ) : (
                        <span className="text-3xs text-muted-foreground italic">
                          No phone
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      <DriverOnboardingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
