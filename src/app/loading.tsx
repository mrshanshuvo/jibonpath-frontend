import { Skeleton } from "@/components/shared/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar Skeleton */}
      <div className="h-16 border-b border-border/80 px-8 flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
