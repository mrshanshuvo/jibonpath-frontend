import { AuditLogsTable } from "@/features/admin";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          System Audit Trail & Security Logs
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Immutable audit record of all administrative actions, emergency dispatches, user updates, and status transitions.
        </p>
      </div>

      <AuditLogsTable />
    </div>
  );
}
