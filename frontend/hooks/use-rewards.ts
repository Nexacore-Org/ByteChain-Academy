"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface EarnedBadge {
  badge: {
    id: string;
    key: string;
    name: string;
    description: string;
    xpThreshold: number;
    iconUrl?: string;
  };
  awardedAt: string;
}

export interface MilestoneBadge {
  id: string;
  key: string;
  name: string;
  description: string;
  xpThreshold: number;
  iconUrl?: string;
}

export type HistoryReason = "LESSON_COMPLETE" | "QUIZ_PASS" | "COURSE_COMPLETE";

export interface RewardHistoryEntry {
  id: string;
  amount: number;
  reason: HistoryReason;
  createdAt: string;
}

export interface MyRewards {
  xp: number;
  badges: EarnedBadge[];
  recentHistory: RewardHistoryEntry[];
}

export interface LeaderboardEntry {
  username: string | null;
  xp: number;
}

export function useMyRewards() {
  return useQuery<MyRewards>({
    queryKey: ["rewards", "my"],
    queryFn: () => api.get<MyRewards>("/rewards/my"),
  });
}

export function useLeaderboard() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["rewards", "leaderboard"],
    queryFn: () => api.get<LeaderboardEntry[]>("/rewards/leaderboard"),
  });
}

export function useMilestoneBadges() {
  return useQuery<MilestoneBadge[]>({
    queryKey: ["rewards", "milestones"],
    queryFn: () => api.get<MilestoneBadge[]>("/rewards/milestones"),
  });
}
