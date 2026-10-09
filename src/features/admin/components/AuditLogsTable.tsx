"use client";

import { FileText, AlertCircle, Tag } from "lucide-react";
import {
  Button,
  Badge,
  Skeleton,
  Pagination,
  EmptyState,
} from "@/components/shared";
import { useUrlParams } from "@/hooks/useUrlParams";
import { useAuditLogs } from "../api/admin.queries";
import { formatDateTime } from "@/lib/utils";

export function AuditLogsTable() {
  const { params, setParams } = useUrlParams();

  const rawAction = params.get("action");
  const selectedAction = rawAction && rawAction !== "" ? rawAction : "ALL";

  const parsedPage = Number(params.get("page") ?? "1");
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    limit: 10,
    action: selectedAction === "ALL" ? undefined : selectedAction,
  });

  const actions = [
    "ALL",
    "CREATE",
    "UPDATE",
    "DELETE",
    "DISPATCH",
    "STATUS_UPDATE",
    "CANCEL",
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case "DISPATCH":
        return (
          <Badge variant="emergency" size="sm">
            {action}
          </Badge>
        );
      case "CREATE":
        return (
          <Badge variant="info" size="sm">
            {action}
          </Badge>
        );
      case "STATUS_UPDATE":
      case "UPDATE":
        return (
          <Badge variant="warning" size="sm">
            {action}
          </Badge>
        );
      case "DELETE":
      case "CANCEL":
        return (
          <Badge variant="danger" size="sm">
            {action}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" size="sm">
            {action}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {actions.map((act) => (
          <button
            key={act}
            onClick={() => {
              setParams({
                action: act === "ALL" ? "" : act,
                page: "1",
              });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedAction === act
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-raised"
            }`}
          >
            {act === "ALL" ? "All Actions" : act}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center gap-4"
              >
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h3 className="text-base font-bold text-foreground">
              Failed to load audit logs
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data?.logs || data.logs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FileText}
              title="No Audit Logs Recorded"
              description="No security or system activity matches the selected criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-surface/50 text-3xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Responsible Actor</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground">
                {data.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-raised/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-3xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="px-5 py-4">{getActionBadge(log.action)}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{log.entityType}</span>
                        <span className="font-mono text-3xs text-muted-foreground">
                          (#{log.entityId.slice(0, 6)})
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {log.actor ? (
                        <div>
                          <span className="font-medium text-foreground block">
                            {log.actor.name}
                          </span>
                          <span className="text-3xs font-mono text-muted-foreground">
                            {log.actor.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xs text-muted-foreground italic">
                          System Automated
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {log.metadata ? (
                        <span
                          className="font-mono text-3xs text-muted-foreground max-w-40 truncate inline-block"
                          title={JSON.stringify(log.metadata)}
                        >
                          {JSON.stringify(log.metadata)}
                        </span>
                      ) : (
                        <span className="text-3xs text-muted-foreground italic">
                          None
                        </span>
                      )}
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
              onPageChange={(p) => setParams({ page: String(p) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
