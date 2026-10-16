"use client";

import { Clock, CheckCircle2, FileText } from "lucide-react";
import { Card } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { TripStatusLog } from "@/types/entities.types";

interface TripLogsTimelineProps {
  logs: TripStatusLog[];
}

export function TripLogsTimeline({ logs }: TripLogsTimelineProps) {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>Trip Status Audit Trail ({logs.length} checkpoints)</span>
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          Real-Time Log
        </span>
      </div>

      <div className="relative border-l border-border/70 ml-3.5 space-y-6 pl-6 py-2">
        {sortedLogs.map((log) => (
          <div key={log.id} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-8.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface border border-success-ink/60 shadow-xs">
              <CheckCircle2 className="h-3 w-3 text-success-ink" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {log.status}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>

              {log.note && (
                <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-surface/60 border border-border/40 p-2.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                  <span>{log.note}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
