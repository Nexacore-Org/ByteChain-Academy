"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LessonRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border border-white/10 rounded-lg">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}
