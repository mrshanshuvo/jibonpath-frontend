import type { ReactNode } from "react";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There is currently no data to display for this view.",
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("w-full overflow-hidden rounded-lg border border-border bg-card", className)}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-raised text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn("px-4 py-3 font-semibold", col.headerClassName)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="bg-surface/30">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-28" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-raised text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn("px-4 py-3.5 font-semibold", col.headerClassName)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-surface-raised/40 transition-colors duration-150"
              >
                {columns.map((col) => {
                  const val = (item as Record<string, unknown>)[col.key];
                  return (
                    <td key={col.key} className={cn("px-4 py-3 text-foreground", col.className)}>
                      {col.render ? col.render(item) : String(val ?? "—")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
