"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Award, Flame, GraduationCap, Trophy, Zap } from "lucide-react";

interface StatsSummaryProps {
  xp: number;
  streak: number;
  badgesCount: number;
  certificatesCount: number;
  completedCourses: number;
}

export function StatsSummary({
  xp,
  streak,
  badgesCount,
  certificatesCount,
  completedCourses,
}: StatsSummaryProps) {
  const cards = [
    {
      label: "XP",
      value: xp.toLocaleString(),
      icon: Zap,
      valueClassName: "text-[#00ff88]",
      iconClassName: "text-[#00ff88]",
      borderClassName: "border-[#00ff88]/20",
    },
    {
      label: "Streak",
      value: String(streak),
      icon: Flame,
      valueClassName: "text-orange-400",
      iconClassName: "text-orange-400",
      borderClassName: "border-orange-400/20",
    },
    {
      label: "Badges",
      value: String(badgesCount),
      icon: Award,
      valueClassName: "text-white",
      iconClassName: "text-[#00ff88]",
      borderClassName: "border-white/10",
    },
    {
      label: "Certificates",
      value: String(certificatesCount),
      icon: GraduationCap,
      valueClassName: "text-white",
      iconClassName: "text-[#00ff88]",
      borderClassName: "border-white/10",
    },
    {
      label: "Completed Courses",
      value: String(completedCourses),
      icon: Trophy,
      valueClassName: "text-white",
      iconClassName: "text-[#00ff88]",
      borderClassName: "border-white/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className={`bg-[#080e22] ${item.borderClassName}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                <Icon className={`w-4 h-4 ${item.iconClassName}`} />
              </div>
              <p className={`text-2xl font-bold ${item.valueClassName}`}>{item.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
