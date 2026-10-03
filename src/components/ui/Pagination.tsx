"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  page?: number;
  currentPage?: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  const activePage = page ?? currentPage ?? 1;

  if (totalPages <= 1) return null;

  const startItem = total && limit ? (activePage - 1) * limit + 1 : null;
  const endItem = total && limit ? Math.min(activePage * limit, total) : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3",
        className,
      )}
    >
      {total != null && startItem != null && endItem != null ? (
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{startItem}</span> to{" "}
          <span className="font-medium text-foreground">{endItem}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> results
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={activePage <= 1}
          onClick={() => onPageChange(activePage - 1)}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>

        <span className="text-xs font-medium text-foreground px-2">
          Page {activePage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={activePage >= totalPages}
          onClick={() => onPageChange(activePage + 1)}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
