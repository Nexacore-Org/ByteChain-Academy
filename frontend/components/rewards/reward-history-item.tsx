"use client";

import { BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import type { RewardHistoryEntry, HistoryReason } from "@/hooks/use-rewards";

const REASON_META: Record<
  HistoryReason,
  { label: string; Icon: React.ElementType; color: string }
> = {
  LESSON_COMPLETE: {
    label: "Completed a lesson",
    Icon: BookOpen,
    color: "text-blue-400",
  },
  QUIZ_PASS: {
    label: "Passed a quiz",
    Icon: CheckCircle2,
    color: "text-[#00ff88]",
  },
  COURSE_COMPLETE: {
    label: "Completed a course",
    Icon: GraduationCap,
    color: "text-purple-400",
  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface RewardHistoryItemProps {
  entry: RewardHistoryEntry;
}

export function RewardHistoryItem({ entry }: RewardHistoryItemProps) {
  const meta = REASON_META[entry.reason] ?? {
    label: entry.reason,
    Icon: CheckCircle2,
    color: "text-gray-400",
  };
  const { label, Icon, color } = meta;

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm text-white">{label}</p>
          <p className="text-xs text-gray-500">{timeAgo(entry.createdAt)}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-[#00ff88] whitespace-nowrap">
        +{entry.amount} XP
      </span>
    </div>
  );
}
