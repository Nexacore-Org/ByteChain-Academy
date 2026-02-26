"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoursePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CoursePagination({
  page,
  totalPages,
  onPageChange,
  className,
}: CoursePaginationProps) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <div
      className={cn("flex items-center justify-between gap-4", className)}
      role="navigation"
      aria-label="Course list pagination"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={isFirstPage}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Prev
      </Button>
      <span
        className="text-sm text-gray-400"
        aria-live="polite"
        aria-atomic="true"
      >
        Page{" "}
        <span aria-current="page" className="text-white font-medium">
          {page}
        </span>{" "}
        of {totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={isLastPage}
        aria-label="Go to next page"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
