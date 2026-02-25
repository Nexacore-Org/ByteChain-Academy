"use client";

import { cn } from "@/lib/utils";
import type { StatusFilter } from "@/hooks/useCourseFilters";

interface CourseStatCardsProps {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  activeFilter: StatusFilter;
  onFilterChange: (status: StatusFilter) => void;
  className?: string;
}

const baseCardStyles =
  "p-4 rounded-xl border transition-all cursor-pointer select-none focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#00ff88]";

export function CourseStatCards({
  totalCount,
  publishedCount,
  draftCount,
  activeFilter,
  onFilterChange,
  className,
}: CourseStatCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      <button
        type="button"
        onClick={() => onFilterChange("")}
        className={cn(
          baseCardStyles,
          activeFilter === ""
            ? "bg-[#00ff88]/10 border-[#00ff88] border-l-4"
            : "bg-[#0b1327]/50 border-white/10 hover:border-white/20"
        )}
      >
        <div
          className={cn(
            "text-2xl font-bold",
            activeFilter === "" ? "text-[#00ff88]" : "text-white"
          )}
        >
          {totalCount}
        </div>
        <div className="text-sm text-gray-400">Total Courses</div>
      </button>
      <button
        type="button"
        onClick={() => onFilterChange("published")}
        className={cn(
          baseCardStyles,
          activeFilter === "published"
            ? "bg-[#00ff88]/10 border-[#00ff88] border-l-4"
            : "bg-[#0b1327]/50 border-white/10 hover:border-white/20"
        )}
      >
        <div
          className={cn(
            "text-2xl font-bold",
            activeFilter === "published" ? "text-[#00ff88]" : "text-gray-300"
          )}
        >
          {publishedCount}
        </div>
        <div className="text-sm text-gray-400">Published</div>
      </button>
      <button
        type="button"
        onClick={() => onFilterChange("draft")}
        className={cn(
          baseCardStyles,
          activeFilter === "draft"
            ? "bg-[#00ff88]/10 border-[#00ff88] border-l-4"
            : "bg-[#0b1327]/50 border-white/10 hover:border-white/20"
        )}
      >
        <div
          className={cn(
            "text-2xl font-bold",
            activeFilter === "draft" ? "text-[#00ff88]" : "text-gray-300"
          )}
        >
          {draftCount}
        </div>
        <div className="text-sm text-gray-400">Drafts</div>
      </button>
    </div>
  );
}
