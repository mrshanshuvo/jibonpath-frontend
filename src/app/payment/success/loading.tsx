import { FormSkeleton } from "@/components/skeletons";

export default function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <FormSkeleton />
    </div>
  );
}
