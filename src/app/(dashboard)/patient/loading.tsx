import { DashboardSkeleton } from "@/components/skeletons";

export default function PatientLoading() {
  return <DashboardSkeleton statsCount={3} hasChart={false} />;
}
