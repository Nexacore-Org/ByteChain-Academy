"use client";

import { Zap, Flame } from "lucide-react";
import { useUser } from "@/contexts/user-context";

interface XpHeroProps {
  xp: number;
}

export function XpHero({ xp }: XpHeroProps) {
  const { stats } = useUser();
  const streak = stats.streakDays;

  const nextMilestone = Math.max(100, Math.ceil(xp / 100) * 100);
  const prevMilestone = nextMilestone - 100;
  const progress = nextMilestone === prevMilestone
    ? 100
    : Math.round(((xp - prevMilestone) / (nextMilestone - prevMilestone)) * 100);

  return (
    <div className="rounded-2xl border border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a] p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* XP counter */}
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/20">
            <Zap className="w-8 h-8 text-[#00ff88]" />
          </div>
          <div>
            <p className="text-5xl font-bold text-[#00ff88]">
              {xp.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-wider">
              Total XP
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <Flame className="w-6 h-6 text-orange-400" />
          <div>
            <p className="text-2xl font-bold text-orange-400">{streak}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Day Streak
            </p>
          </div>
        </div>
      </div>

      {/* Progress to next milestone */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{xp.toLocaleString()} XP</span>
          <span>Next milestone: {nextMilestone.toLocaleString()} XP</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#00ff88] transition-all duration-700"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {nextMilestone - xp} XP to next milestone
        </p>
      </div>
    </div>
  );
}
