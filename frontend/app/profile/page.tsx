"use client";

import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { StatsSummary } from "@/components/profile/stats-summary";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import {
  ArrowLeft,
  Mail,
  Shield,
  Settings,
  User as UserIcon,
  Loader2,
  ExternalLink,
  Calendar,
  MapPin,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { user, stats, userStats, loadUserData, updateProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-green-500/30">
      <Header />
      
      {/* Premium Profile Header Background */}
      <div className="relative h-64 w-full bg-[#0d0d0d] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-[#0a0a0a]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -ml-32 -mb-32" />
      </div>

      <main className="container mx-auto px-6 -mt-32 pb-20 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Avatar & Basic Info */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <AvatarUpload
                    currentAvatar={user.avatar}
                    fallbackName={user.fullName}
                    onUploadSuccess={(avatarUrl) => {
                      void updateProfile({ avatar: avatarUrl });
                    }}
                  />
                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-white">{user.fullName}</h1>
                    <div className="flex items-center justify-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" />
                      {user.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-gray-400 group hover:text-white transition-colors cursor-default">
                    <Mail className="w-4 h-4 text-gray-600 group-hover:text-green-500" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 cursor-default">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/settings" className="block w-full">
                    <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white gap-2 h-11 rounded-xl">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links / Badges Preview could go here */}
            <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-green-500/60">Academy Standing</h3>
                  <Shield className="w-4 h-4 text-green-500/20" />
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '65%' }} />
                  </div>
                  <span className="text-xs font-bold text-white">Lvl 4</span>
               </div>
               <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                  Complete 2 more modules to reach **Level 5** and unlock the Advanced Smart Contracts certification.
               </p>
            </div>
          </div>

          {/* Right Column: Stats & Tabs */}
          <div className="lg:w-2/3 space-y-8">
            <div className="flex items-center justify-between">
               <Link href="/dashboard">
                <Button variant="ghost" className="gap-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl">
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Member ID: <span className="text-gray-400 font-mono">#{user.id.substring(0, 8)}</span>
              </div>
            </div>

            <StatsSummary
              xp={stats.experiencePoints}
              streak={stats.streakDays}
              badgesCount={stats.badgesCount}
              certificatesCount={stats.certificatesCount}
              completedCourses={userStats?.completedCourseCount ?? 0}
            />

            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-[2rem] blur opacity-25" />
               <div className="relative">
                  <ProfileTabs
                    badgesCount={userStats?.badgesCount ?? stats.badgesCount}
                    lastActiveAt={userStats?.lastActiveAt ?? null}
                  />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
