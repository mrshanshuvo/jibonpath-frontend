import { TableSkeleton } from "@/components/skeletons";

export default function HospitalsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <TableSkeleton />
    </div>
  );
}
