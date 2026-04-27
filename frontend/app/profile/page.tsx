"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { StatsSummary } from "@/components/profile/stats-summary";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import {
  ArrowLeft,
  Mail,
  Shield,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { user, stats, userStats, loadUserData, updateProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-800 rounded mx-auto mb-4"></div>
            <div className="h-4 w-64 bg-gray-800 rounded mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
          <p className="text-gray-400 mt-2">View and manage your account details and progress.</p>
        </div>

        <Card className="mb-8 border-white/10 bg-[#080e22]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AvatarUpload
              currentAvatar={user.avatar}
              fallbackName={user.fullName}
              onUploadSuccess={(avatarUrl) => {
                void updateProfile({ avatar: avatarUrl });
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0b1327] border border-white/10">
                <User className="w-4 h-4 text-[#00ff88]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Username</p>
                  <p className="text-white font-medium">{user.fullName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0b1327] border border-white/10">
                <Mail className="w-4 h-4 text-[#00ff88]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-white font-medium truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0b1327] border border-white/10">
                <Shield className="w-4 h-4 text-[#00ff88]" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
                  <p className="text-white font-medium">{user.role}</p>
                </div>
              </div>
            </div>

            <Link href="/settings">
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Edit Profile Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="mb-8">
          <StatsSummary
            xp={stats.experiencePoints}
            streak={stats.streakDays}
            badgesCount={stats.badgesCount}
            certificatesCount={stats.certificatesCount}
            completedCourses={userStats?.completedCourseCount ?? 0}
          />
        </div>

        <ProfileTabs
          badgesCount={userStats?.badgesCount ?? stats.badgesCount}
          lastActiveAt={userStats?.lastActiveAt ?? null}
        />
      </main>
    </div>
  );
}
