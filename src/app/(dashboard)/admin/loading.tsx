import { DashboardSkeleton } from "@/components/skeletons";

export default function AdminLoading() {
  return <DashboardSkeleton statsCount={4} hasChart={true} />;
}
