"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useRequest } from "@/features/emergency/api/emergency.queries";
import { MobilizeCommandTerminal } from "@/features/dispatch";
import { Button, Skeleton } from "@/components/shared";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MobilizeDispatchPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;

  const {
    data: request,
    isLoading,
    isError,
  } = useRequest(requestId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-5 xl:col-span-4 h-120 rounded-2xl" />
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto bg-card rounded-2xl border border-border shadow-xl mt-12">
        <AlertTriangle className="h-10 w-10 text-emergency mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Incident Not Found</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The requested emergency incident does not exist, has already been mobilized,
          or you do not have permission to access it.
        </p>
        <Link href="/admin/dispatches?tab=queue">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Triage Queue</span>
          </Button>
        </Link>
      </div>
    );
  }

  return <MobilizeCommandTerminal request={request} />;
}
