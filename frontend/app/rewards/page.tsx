"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Gift, Trophy, Clock, Award } from "lucide-react";
import Link from "next/link";
import { useMyRewards, useLeaderboard, useMilestoneBadges } from "@/hooks/use-rewards";
import { XpHero } from "@/components/rewards/xp-hero";
import { EarnedBadgeCard, LockedBadgeCard } from "@/components/rewards/badge-card";
import { RewardHistoryItem } from "@/components/rewards/reward-history-item";
import { LeaderboardTable } from "@/components/rewards/leaderboard-table";

type Tab = "rewards" | "leaderboard";

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function RewardsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("rewards");

  const { data: myRewards, isLoading: myLoading, isError: myError } = useMyRewards();
  const { data: leaderboard, isLoading: lbLoading, isError: lbError } = useLeaderboard();
  const { data: milestones } = useMilestoneBadges();

  useEffect(() => {
    if (!isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const earnedKeys = new Set(myRewards?.badges.map((b) => b.badge.key) ?? []);
  const lockedMilestones = (milestones ?? []).filter((m) => !earnedKeys.has(m.key));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back link */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Page heading */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
              <Gift className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Rewards</h1>
          </div>
          <p className="text-gray-400">
            Track your XP, badges, and see how you rank against other learners.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/5 w-fit">
          <button
            onClick={() => setTab("rewards")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "rewards"
                ? "bg-[#00ff88] text-[#002E20]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            My Rewards
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "leaderboard"
                ? "bg-[#00ff88] text-[#002E20]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </button>
        </div>

        {/* ── MY REWARDS TAB ── */}
        {tab === "rewards" && (
          <div className="space-y-8">
            {/* XP Hero */}
            {myLoading ? (
              <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
            ) : myError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 text-sm">
                Failed to load rewards data. Please try again.
              </div>
            ) : myRewards ? (
              <XpHero xp={myRewards.xp} />
            ) : null}

            {/* Badges */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#00ff88]" />
                Badges
              </h2>
              {myLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {(myRewards?.badges.length ?? 0) === 0 && lockedMilestones.length === 0 ? (
                    <p className="text-sm text-gray-500">No badge data available yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {myRewards?.badges.map((eb) => (
                        <EarnedBadgeCard key={eb.badge.id} earned={eb} />
                      ))}
                      {lockedMilestones.map((m) => (
                        <LockedBadgeCard key={m.id} milestone={m} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Reward history */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00ff88]" />
                Reward History
              </h2>
              {myLoading ? (
                <SectionSkeleton rows={5} />
              ) : (myRewards?.recentHistory.length ?? 0) === 0 ? (
                <div className="rounded-xl border border-white/5 p-8 text-center text-gray-500 text-sm">
                  No XP events yet. Complete lessons and quizzes to earn XP!
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 px-4">
                  {myRewards!.recentHistory.map((entry) => (
                    <RewardHistoryItem key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab === "leaderboard" && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00ff88]" />
              Top Learners
            </h2>
            {lbLoading ? (
              <SectionSkeleton rows={10} />
            ) : lbError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 text-sm">
                Failed to load leaderboard.
              </div>
            ) : (leaderboard?.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-white/5 p-8 text-center text-gray-500 text-sm">
                No learners on the leaderboard yet.
              </div>
            ) : (
              <LeaderboardTable entries={leaderboard!} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
