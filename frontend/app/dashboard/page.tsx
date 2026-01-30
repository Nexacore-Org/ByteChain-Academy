"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useLearning } from "@/contexts/learning-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Play,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
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
  Users,
  Timer,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const { courses } = useLearning()
  const router = useRouter()
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <p className="text-gray-400">You need to be authenticated to view your learning progress.</p>
        </main>
      </div>
    )
  }

  const enrolledCourses = courses.filter((c) => c.enrolled)
  const availableCourses = courses.filter((c) => !c.enrolled)

  // Calculate stats
  const totalLessons = enrolledCourses.reduce((sum, course) => sum + course.lessons.length, 0)
  const completedLessons = enrolledCourses.reduce(
    (sum, course) => sum + course.lessons.filter((l) => l.completed).length,
    0
  )
  const averageProgress =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length
      : 0
  const coursesInProgress = enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100).length

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }))
  }

  const handleCourseClick = (courseId: string, e: React.MouseEvent) => {
    // Only navigate if clicking on the course card itself, not the dropdown arrow
    const target = e.target as HTMLElement
    if (!target.closest("button") && !target.closest("[data-dropdown]")) {
      router.push(`/courses/${courseId}`)
    }
  }

  const handleDropdownClick = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleCourse(courseId)
  }

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

          {/* Stats Cards */}
          {enrolledCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-6 h-6 text-[#00ff88]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Total Progress
                    </p>
                    <p className="text-3xl font-bold text-[#00ff88] mb-1">{Math.round(averageProgress)}%</p>
                    <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d88b] rounded-full transition-all duration-500"
                        style={{ width: `${averageProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle2 className="w-6 h-6 text-[#00ff88]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <BookCheck className="w-4 h-4" />
                      Lessons Completed
                    </p>
                    <p className="text-3xl font-bold text-white">
                      <span className="text-[#00ff88]">{completedLessons}</span>
                      <span className="text-gray-500"> / {totalLessons}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}% completion rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 group-hover:scale-110 transition-transform duration-300">
                      <Rocket className="w-6 h-6 text-[#00ff88]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Active Courses
                    </p>
                    <p className="text-3xl font-bold text-white">{coursesInProgress}</p>
                    <p className="text-xs text-gray-500 mt-2">In progress</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20 hover:border-[#00ff88]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 group-hover:scale-110 transition-transform duration-300">
                      <BookMarked className="w-6 h-6 text-[#00ff88]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Enrolled Courses
                    </p>
                    <p className="text-3xl font-bold text-white">{enrolledCourses.length}</p>
                    <p className="text-xs text-gray-500 mt-2">Total enrolled</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
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
                  className="group relative overflow-hidden cursor-pointer hover:border-[#00ff88]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#00ff88]/5 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]"
                  onClick={(e) => handleCourseClick(course.id, e)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/0 via-[#00ff88]/5 to-[#00ff88]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-40 h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-gradient-to-r from-[#00ff88] via-[#00d88b] to-[#00ff88] rounded-full transition-all duration-500 shadow-lg shadow-[#00ff88]/30"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-[#00ff88] min-w-[3rem]">
                                {Math.round(course.progress)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <BookCheck className="w-4 h-4" />
                            <span>
                              {course.lessons.filter((l) => l.completed).length} / {course.lessons.length} lessons
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Timer className="w-4 h-4" />
                            <span>{course.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-dropdown
                        onClick={(e) => handleDropdownClick(course.id, e)}
                        className="ml-4 hover:bg-[#00ff88]/10 hover:text-[#00ff88] transition-colors"
                      >
                        {expandedCourses[course.id] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedCourses[course.id] && (
                    <CardContent className="pt-0 relative">
                      <div className="space-y-2 border-t border-white/10 pt-4">
                        {course.lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="group/lesson flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/courses/${course.id}/lessons/${lesson.id}`)
                            }}
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs text-gray-400 font-semibold border border-white/10">
                              {index + 1}
                            </div>
                            {lesson.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#00ff88] flex-shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0 group-hover/lesson:border-[#00ff88]/50 transition-colors" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-white group-hover/lesson:text-[#00ff88] transition-colors">
                                  {lesson.title}
                                </span>
                                {lesson.hasQuiz && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#00ff88] border border-[#00ff88]/30 flex items-center gap-1">
                                    <FileQuestion className="w-3 h-3" />
                                    Quiz
                                  </span>
                                )}
                              </div>
                            </div>
                            <Play className="w-4 h-4 text-gray-400 group-hover/lesson:text-[#00ff88] transition-colors flex-shrink-0" />
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
        {availableCourses.length > 0 && (
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
                  className="group relative overflow-hidden cursor-pointer hover:border-[#00ff88]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#00ff88]/5 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/0 to-[#00ff88]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardHeader className="relative">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="w-5 h-5 text-[#00ff88]" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 font-bold">{course.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm text-gray-400">{course.rating}</span>
                          <span className="text-gray-600">•</span>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
                  </CardHeader>
                  <CardContent className="relative">
                    <Button className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20] hover:from-[#00d88b] hover:to-[#00ff88] transition-all duration-300 font-semibold flex items-center justify-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Enroll Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {enrolledCourses.length === 0 && availableCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88] to-[#00d88b] rounded-full blur-2xl opacity-20 animate-pulse" />
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
  )
}
