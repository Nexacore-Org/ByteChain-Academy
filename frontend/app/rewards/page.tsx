"use client";

import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, Gift, Zap, Award, Flame } from "lucide-react";
import Link from "next/link";

export default function RewardsPage() {
  const { isAuthenticated } = useAuth();
  const { user, stats } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
              <Gift className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Rewards</h1>
          </div>
          <p className="text-gray-400">
            Track your achievements, badges, and rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-[#00ff88]/20 border border-[#00ff88]/30 mb-3">
                  <Zap className="w-6 h-6 text-[#00ff88]" />
                </div>
                <p className="text-3xl font-bold text-[#00ff88]">{stats.experiencePoints.toLocaleString()}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">XP Points</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-[#00ff88]/20 border border-[#00ff88]/30 mb-3">
                  <Award className="w-6 h-6 text-[#00ff88]" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.badgesCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Badges</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-[#00ff88]/20 border border-[#00ff88]/30 mb-3">
                  <Award className="w-6 h-6 text-[#00ff88]" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.certificatesCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Certificates</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30 mb-3">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500">{stats.streakDays}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Day Streak</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
