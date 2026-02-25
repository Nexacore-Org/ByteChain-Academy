"use client";

import { useUser } from "@/contexts/user-context";
import { BookOpen, Award, Zap } from "lucide-react";

function CounterSkeleton() {
  return (
    <div className="h-8 w-16 animate-pulse rounded-lg bg-white/10" aria-hidden />
  );
}

export function NavCounters() {
  const { userStats, userStatsLoading, userStatsError } = useUser();

  const displayValue = (value: number | undefined) => {
    if (userStatsError) return "—";
    if (value === undefined || value === null) return "—";
    return value.toLocaleString();
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-[#0f1629]/50 px-4 py-2">
      <div className="flex items-center gap-2 text-sm">
        <BookOpen className="h-4 w-4 text-[#00ff88]" />
        {userStatsLoading ? (
          <CounterSkeleton />
        ) : (
          <span className="font-medium text-white">
            Courses ({displayValue(userStats?.courseCount)})
          </span>
        )}
      </div>
      <div className="h-4 w-px bg-white/20" />
      <div className="flex items-center gap-2 text-sm">
        <Award className="h-4 w-4 text-[#00ff88]" />
        {userStatsLoading ? (
          <CounterSkeleton />
        ) : (
          <span className="font-medium text-white">
            Certs ({displayValue(userStats?.certificateCount)})
          </span>
        )}
      </div>
      <div className="h-4 w-px bg-white/20" />
      <div className="flex items-center gap-2 text-sm">
        <Zap className="h-4 w-4 text-[#00ff88]" />
        {userStatsLoading ? (
          <CounterSkeleton />
        ) : (
          <span className="font-medium text-white">
            {displayValue(userStats?.xp)} XP Points
          </span>
        )}
      </div>
    </div>
  );
}
