"use client";

import type { EarnedBadge, MilestoneBadge } from "@/hooks/use-rewards";

interface EarnedBadgeCardProps {
  earned: EarnedBadge;
}

interface LockedBadgeCardProps {
  milestone: MilestoneBadge;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EarnedBadgeCard({ earned }: EarnedBadgeCardProps) {
  const { badge, awardedAt } = earned;
  return (
    <div className="flex flex-col items-center text-center p-5 rounded-xl border border-[#00ff88]/30 bg-gradient-to-b from-[#00ff88]/5 to-transparent">
      <div className="text-4xl mb-3">{badge.iconUrl ?? "🏅"}</div>
      <p className="font-semibold text-white text-sm">{badge.name}</p>
      <p className="text-xs text-gray-400 mt-1 leading-snug">{badge.description}</p>
      <p className="text-xs text-[#00ff88]/70 mt-3">
        Earned {formatDate(awardedAt)}
      </p>
    </div>
  );
}

export function LockedBadgeCard({ milestone }: LockedBadgeCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-5 rounded-xl border border-white/5 bg-white/2 opacity-50 grayscale">
      <div className="text-4xl mb-3 blur-[2px]">{milestone.iconUrl ?? "🏅"}</div>
      <p className="font-semibold text-gray-500 text-sm">{milestone.name}</p>
      <p className="text-xs text-gray-600 mt-1 leading-snug">{milestone.description}</p>
      <p className="text-xs text-gray-600 mt-3">Locked</p>
    </div>
  );
}
