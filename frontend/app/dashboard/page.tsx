"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Play,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Clock,
  FileQuestion,
  Sparkles,
  ArrowRight,
  BookMarked,
  Target,
  Zap,
  BarChart3,
  BookCheck,
  Rocket,
  Star,
  Timer,
  Flame,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  hasQuiz?: boolean;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: Lesson[];
  duration?: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  rating?: number;
  duration?: number;
}

interface UserStats {
  courseCount: number;
  completedCourseCount?: number;
  certificateCount: number;
  xp: number;
  streak: number;
}

function StatSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20">
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  const { data: enrolledCourses = [], isLoading: enrolledLoading } = useQuery({
    queryKey: ["courses", "enrolled"],
    queryFn: () => api.get<EnrolledCourse[]>("/courses/enrolled"),
    enabled: isAuthenticated,
  });

  const { data: allCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", "all"],
    queryFn: () => api.get<Course[]>("/courses"),
    enabled: isAuthenticated,
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["users", "me", "stats"],
    queryFn: () => api.get<UserStats>("/users/me/stats"),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <p className="text-gray-400">You need to be authenticated to view your learning progress.</p>
        </main>
      </div>
    );
  }

  const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
  const availableCourses = allCourses.filter((c) => !enrolledIds.has(c.id));

  const totalLessons = enrolledCourses.reduce((s, c) => s + (c.lessons?.length ?? 0), 0);
  const completedLessons = enrolledCourses.reduce(
    (s, c) => s + (c.lessons?.filter((l) => l.completed).length ?? 0),
    0
  );
  const averageProgress =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce((s, c) => s + (c.progress ?? 0), 0) / enrolledCourses.length
      : 0;

  // Continue learning: first in-progress course
  const continueCourse = enrolledCourses.find((c) => c.progress > 0 && c.progress < 100);
  const nextLesson = continueCourse?.lessons?.find((l) => !l.completed);

  const toggleCourse = (id: string) =>
    setExpandedCourses((prev) => ({ ...prev, [id]: !prev[id] }));

  const isLoading = enrolledLoading || coursesLoading || statsLoading;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88] to-[#00d88b] rounded-2xl blur-xl opacity-30 animate-pulse" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 backdrop-blur-sm">
                <GraduationCap className="w-8 h-8 text-[#00ff88]" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                My Dashboard
              </h1>
              <p className="text-gray-400 text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00ff88]" />
                Continue your learning journey
              </p>
            </div>
          </div>

          {/* Streak indicator */}
          {!statsLoading && (
            <div className="mb-6">
              {(userStats?.streak ?? 0) > 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="font-semibold">{userStats!.streak} day streak!</span>
                  <span className="text-sm text-orange-300">Keep it up 🔥</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">Start a lesson today to begin your streak!</span>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
            </div>
          ) : enrolledCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 w-fit mb-4">
                    <TrendingUp className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Total Progress</p>
                  <p className="text-3xl font-bold text-[#00ff88]">{Math.round(averageProgress)}%</p>
                  <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d88b] rounded-full" style={{ width: `${averageProgress}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 w-fit mb-4">
                    <CheckCircle2 className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><BookCheck className="w-4 h-4" />Lessons Completed</p>
                  <p className="text-3xl font-bold text-white">
                    <span className="text-[#00ff88]">{completedLessons}</span>
                    <span className="text-gray-500"> / {totalLessons}</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 w-fit mb-4">
                    <Zap className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2">XP Points</p>
                  <p className="text-3xl font-bold text-white">{(userStats?.xp ?? 0).toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 w-fit mb-4">
                    <BookMarked className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-2"><Target className="w-4 h-4" />Enrolled Courses</p>
                  <p className="text-3xl font-bold text-white">{userStats?.courseCount ?? enrolledCourses.length}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Continue Learning */}
        {continueCourse && nextLesson && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                <Rocket className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h2 className="text-2xl font-semibold">Continue Learning</h2>
            </div>
            <Card className="bg-gradient-to-br from-[#080e22] to-[#0a0a0a] border-[#00ff88]/30">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{continueCourse.title}</p>
                  <p className="text-white font-semibold">{nextLesson.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-32 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00ff88] rounded-full" style={{ width: `${continueCourse.progress}%` }} />
                    </div>
                    <span className="text-xs text-[#00ff88]">{Math.round(continueCourse.progress)}%</span>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/courses/${continueCourse.id}/lessons/${nextLesson.id}`)}
                  className="bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20] font-semibold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enrolled Courses */}
        {isLoading ? (
          <div className="mb-12 space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-[#080e22] to-[#0a0a0a] border-[#00ff88]/20">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : enrolledCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                <BookOpen className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h2 className="text-2xl font-semibold">My Courses</h2>
            </div>
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group relative overflow-hidden cursor-pointer hover:border-[#00ff88]/50 transition-all duration-300 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                            <GraduationCap className="w-5 h-5 text-[#00ff88]" />
                          </div>
                          <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-40 h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d88b] rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#00ff88]">{Math.round(course.progress)}%</span>
                          </div>
                          {course.lessons && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <BookCheck className="w-4 h-4" />
                              <span>{course.lessons.filter((l) => l.completed).length} / {course.lessons.length} lessons</span>
                            </div>
                          )}
                          {course.duration && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Timer className="w-4 h-4" />
                              <span>{course.duration} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); toggleCourse(course.id); }}
                        className="hover:bg-[#00ff88]/10 hover:text-[#00ff88]"
                      >
                        {expandedCourses[course.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedCourses[course.id] && course.lessons && (
                    <CardContent className="pt-0">
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        {course.lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); router.push(`/courses/${course.id}/lessons/${lesson.id}`); }}
                          >
                            <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs text-gray-400 border border-white/10">
                              {index + 1}
                            </div>
                            {lesson.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#00ff88] flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{lesson.title}</span>
                              {lesson.hasQuiz && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/30 flex items-center gap-1">
                                  <FileQuestion className="w-3 h-3" />Quiz
                                </span>
                              )}
                            </div>
                            <Play className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {!coursesLoading && availableCourses.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                <Sparkles className="w-5 h-5 text-[#00ff88]" />
              </div>
              <h2 className="text-2xl font-semibold">Available Courses</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group cursor-pointer hover:border-[#00ff88]/50 transition-all duration-300 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                        <BookOpen className="w-5 h-5 text-[#00ff88]" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 font-bold">{course.title}</CardTitle>
                        {course.rating && (
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-400">{course.rating}</span>
                            {course.duration && (
                              <>
                                <span className="text-gray-600">•</span>
                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  <span>{course.duration} min</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20] font-semibold flex items-center justify-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Enroll Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && enrolledCourses.length === 0 && availableCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="relative p-6 rounded-full bg-gradient-to-br from-[#00ff88]/10 to-[#00d88b]/5 border border-[#00ff88]/20">
                <BookOpen className="w-16 h-16 text-[#00ff88]" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-white">No courses available</h3>
            <p className="text-gray-400 text-lg">Check back later for new courses!</p>
          </div>
        )}
      </main>
    </div>
  );
}
