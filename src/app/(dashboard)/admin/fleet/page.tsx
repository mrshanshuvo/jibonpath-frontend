import { FleetTable } from "@/features/fleet";

export default function AdminFleetPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Ambulance Fleet Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor response units, equipment specifications, maintenance
          scheduling, and metropolitan deployment readiness.
        </p>
      </div>

      <FleetTable />
    </div>
  );
}
