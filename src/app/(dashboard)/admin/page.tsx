import { AdminAnalyticsOverview } from "@/features/admin";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Emergency Command & Analytics Console
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Real-time Dhaka metropolitan dispatch metrics, fleet capacity
          utilization, patient triage resolution, and revenue tracking.
        </p>
      </div>

      <AdminAnalyticsOverview />
    </div>
  );
}
