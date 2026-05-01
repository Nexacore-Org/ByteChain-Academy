"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Award, Flame, GraduationCap, Trophy, Zap, Sparkles } from "lucide-react";

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
      label: "Experience",
      value: xp.toLocaleString(),
      subValue: "XP Earned",
      icon: Zap,
      color: "from-green-500 to-emerald-700",
      iconColor: "text-green-400",
    },
    {
      label: "Daily Streak",
      value: String(streak),
      subValue: "Days Active",
      icon: Flame,
      color: "from-orange-500 to-red-600",
      iconColor: "text-orange-400",
    },
    {
      label: "Certifications",
      value: String(certificatesCount),
      subValue: "Verifiable",
      icon: GraduationCap,
      color: "from-blue-500 to-indigo-600",
      iconColor: "text-blue-400",
    },
    {
      label: "Achievements",
      value: String(badgesCount),
      subValue: "Badges",
      icon: Award,
      color: "from-purple-500 to-pink-600",
      iconColor: "text-purple-400",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="relative overflow-hidden border-white/5 bg-[#0d0d0d] transition-all hover:border-white/10 group">
            <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${item.color} opacity-30 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">{item.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-white tracking-tighter">{item.value}</p>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase">{item.subValue}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/5 ${item.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
