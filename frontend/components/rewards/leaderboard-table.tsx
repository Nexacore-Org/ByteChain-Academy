"use client";

import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/hooks/use-rewards";
import { useUser } from "@/contexts/user-context";
import { cn } from "@/lib/utils";

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-orange-400"];

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const { user } = useUser();
  const topXp = entries[0]?.xp ?? 1;

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const rank = i + 1;
        const isCurrentUser =
          user && entry.username === (user.fullName ?? null);
        const barWidth = Math.max(4, Math.round((entry.xp / topXp) * 100));

        return (
          <div
            key={`${entry.username ?? "anon"}-${i}`}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors",
              isCurrentUser
                ? "border-[#00ff88]/40 bg-[#00ff88]/5"
                : "border-white/5 bg-white/2 hover:bg-white/5"
            )}
          >
            {/* Rank */}
            <span
              className={cn(
                "w-7 text-center font-bold text-sm shrink-0",
                rank <= 3 ? RANK_COLORS[rank - 1] : "text-gray-500"
              )}
            >
              {rank <= 3 ? (
                <Trophy className="w-4 h-4 mx-auto" />
              ) : (
                `#${rank}`
              )}
            </span>

            {/* Username + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    isCurrentUser ? "text-[#00ff88]" : "text-white"
                  )}
                >
                  {entry.username ?? "Anonymous"}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-[#00ff88]/60">(you)</span>
                  )}
                </span>
                <span className="text-sm font-semibold text-gray-300 ml-3 shrink-0">
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCurrentUser ? "bg-[#00ff88]" : "bg-white/30"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
