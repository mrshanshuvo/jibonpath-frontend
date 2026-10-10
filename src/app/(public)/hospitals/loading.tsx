import { TableSkeleton } from "@/components/skeletons";

export default function HospitalsLoading() {
  return (
    <div className="w-full px-4 py-8">
      <TableSkeleton />
    </div>
  );
}
