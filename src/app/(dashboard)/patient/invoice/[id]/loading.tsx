import { FormSkeleton } from "@/components/skeletons";

export default function InvoiceLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <FormSkeleton />
    </div>
  );
}
