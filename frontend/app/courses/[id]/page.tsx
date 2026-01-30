"use client"

import { use } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLearning } from "@/contexts/learning-context"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  FileQuestion, 
  CirclePlay,
  Play,
  BookOpen,
  Clock,
  Star,
  Award,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { courses, getQuiz } = useLearning()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const course = courses.find((c) => c.id === id)

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Course not found</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </main>
      </div>
    )
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order)

  const handleLessonClick = (lessonId: string) => {
    if (isAuthenticated) {
      router.push(`/courses/${course.id}/lessons/${lessonId}`)
    }
  }

  const handleQuizClick = (quizId: string) => {
    if (isAuthenticated) {
      router.push(`/courses/${course.id}/quizzes/${quizId}`)
    }
  }

  const handleFinalQuizClick = () => {
    if (isAuthenticated) {
      router.push(`/courses/${course.id}/quizzes/final-${course.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href={isAuthenticated ? "/dashboard" : "/courses"}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-400 text-lg mb-6">{course.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#00ff88]" />
              <span>Difficulty: {course.difficulty}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>Rating: {course.rating}/5</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#00ff88]" />
              <span>{course.duration} min</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#00ff88]" />
              <span>{course.lessons.length} lessons</span>
            </div>
          </div>
          {course.enrolled && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-400">Progress:</span>
                <div className="w-64 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d88b] transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">{Math.round(course.progress)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
              <BookOpen className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h2 className="text-2xl font-semibold">Lessons</h2>
          </div>
          {sortedLessons.length > 0 ? (
            sortedLessons.map((lesson, index) => (
              <Card
                key={lesson.id}
                className={`group relative overflow-hidden cursor-pointer hover:border-[#00ff88]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/5 ${
                  !isAuthenticated ? "opacity-60" : ""
                }`}
                onClick={() => handleLessonClick(lesson.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/0 via-[#00ff88]/5 to-[#00ff88]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:border-[#00ff88]/30 transition-colors">
                        {index + 1}
                      </div>
                      {lesson.completed && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center border-2 border-[#0a0a0a] shadow-lg">
                          <CheckCircle2 className="w-3 h-3 text-[#002E20] fill-[#00ff88]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold group-hover:text-[#00ff88] transition-colors">
                          {lesson.title}
                        </h3>
                        {lesson.hasQuiz && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] text-[#00ff88] border border-[#00ff88]/30 flex items-center gap-1.5 font-medium">
                            <FileQuestion className="w-3.5 h-3.5" />
                            Quiz
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{lesson.description}</p>
                      {lesson.hasQuiz && lesson.quizId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQuizClick(lesson.quizId!)
                          }}
                          className="mt-2 border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 hover:border-[#00ff88]/50 transition-all"
                        >
                          <FileQuestion className="w-4 h-4 mr-2" />
                          Take Quiz
                        </Button>
                      )}
                    </div>
                    <div className="flex-shrink-0 relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#00ff88]/30 group-hover:to-[#00d88b]/20 transition-all duration-300 shadow-lg shadow-[#00ff88]/10">
                        <CirclePlay className="w-6 h-6 text-[#00ff88] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-400">
                No lessons available yet.
              </CardContent>
            </Card>
          )}

          {/* Final Course Quiz */}
          {isAuthenticated && course.enrolled && sortedLessons.length > 0 && (
            <Card className="mt-8 border-[#00ff88]/30 bg-gradient-to-br from-[#00ff88]/5 via-[#080e22] to-[#0a0a0a] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/0 via-[#00ff88]/10 to-[#00ff88]/0 opacity-50" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#00ff88]/20 to-[#00d88b]/10 border border-[#00ff88]/30">
                    <Award className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Final Course Quiz
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-400 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00ff88]" />
                  Complete the final quiz to test your understanding of the entire course.
                </p>
                <Button 
                  onClick={handleFinalQuizClick} 
                  className="bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20] hover:from-[#00d88b] hover:to-[#00ff88] transition-all duration-300 font-semibold shadow-lg shadow-[#00ff88]/20 flex items-center gap-2"
                >
                  <FileQuestion className="w-4 h-4" />
                  Take Final Course Quiz
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
      </main>
    </div>
  )
}
