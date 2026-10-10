import { FormSkeleton } from "@/components/skeletons";

export default function InvoiceLoading() {
  return (
    <div className="w-full py-6 space-y-6">
      <FormSkeleton />
    </div>
  );
}
