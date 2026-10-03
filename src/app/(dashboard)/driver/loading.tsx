import { DashboardSkeleton } from "@/components/skeletons";

export default function DriverLoading() {
  return <DashboardSkeleton statsCount={3} hasChart={false} />;
}
