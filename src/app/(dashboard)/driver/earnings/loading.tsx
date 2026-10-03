import { DashboardSkeleton } from "@/components/skeletons";

export default function EarningsLoading() {
  return <DashboardSkeleton statsCount={4} hasChart={true} />;
}
