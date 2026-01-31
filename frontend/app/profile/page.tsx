"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { useLearning } from "@/contexts/learning-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Zap,
  Award,
  GraduationCap,
  Flame,
  ChevronRight,
  Settings,
  BookOpen,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const { user, stats, loadUserData } = useUser();
  const { courses } = useLearning();
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate additional stats from courses
  const enrolledCourses = courses.filter((c) => c.enrolled);
  const completedCourses = enrolledCourses.filter((c) => c.progress === 100);
  const totalLessonsCompleted = enrolledCourses.reduce(
    (sum, course) => sum + course.lessons.filter((l) => l.completed).length,
    0,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Navigation */}
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

        {/* Profile Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
              <User className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
          </div>
          <p className="text-gray-400">
            View your account information and learning statistics
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00ff88]/5" />
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00ff88]" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88] to-[#00d88b] rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d88b] flex items-center justify-center text-[#002E20] text-3xl font-bold shadow-lg shadow-[#00ff88]/20">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.fullName)
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5">
                    <User className="w-5 h-5 text-[#00ff88]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Full Name
                      </p>
                      <p className="text-white font-medium">{user.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5">
                    <Mail className="w-5 h-5 text-[#00ff88]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-white font-medium truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5">
                    <Shield className="w-5 h-5 text-[#00ff88]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Role
                      </p>
                      <p className="text-white font-medium">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5">
                    <BookOpen className="w-5 h-5 text-[#00ff88]" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        Courses Enrolled
                      </p>
                      <p className="text-white font-medium">
                        {enrolledCourses.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Link */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <Link href="/settings">
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Profile Settings
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Learning Statistics */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
              <Trophy className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h2 className="text-2xl font-semibold">Learning Statistics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* XP Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-5 relative">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <p className="text-3xl font-bold text-[#00ff88] mb-1">
                    {stats.experiencePoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Experience (XP)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-5 relative">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {stats.badgesCount}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Badges Earned
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-5 relative">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {stats.certificatesCount}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Certificates
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-5 relative">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-orange-500 mb-1">
                    {stats.streakDays}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Day Streak
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Stats */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00ff88]/5" />
          <CardContent className="p-6 relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5">
                <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                  <BookOpen className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {totalLessonsCompleted}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Lessons Completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5">
                <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                  <Target className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {completedCourses.length}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Courses Completed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1a1a1a]/50 border border-white/5">
                <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                  <Trophy className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {enrolledCourses.length > 0
                      ? Math.round(
                          enrolledCourses.reduce(
                            (sum, c) => sum + c.progress,
                            0,
                          ) / enrolledCourses.length,
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Avg. Progress
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
