"use client"

import { use, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLearning } from "@/contexts/learning-context"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, FileQuestion } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = use(params)
  const { courses, markLessonComplete, getQuiz } = useLearning()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)

  const course = courses.find((c) => c.id === id)
  const lesson = course?.lessons.find((l) => l.id === lessonId)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Please sign in to access lessons</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </main>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Lesson not found</h1>
          <Link href={`/courses/${id}`}>
            <Button variant="outline">Back to Course</Button>
          </Link>
        </main>
      </div>
    )
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order)
  const currentIndex = sortedLessons.findIndex((l) => l.id === lesson.id)
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null

  const handleMarkComplete = async () => {
    setIsCompleting(true)
    // Simulate a brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))
    markLessonComplete(course.id, lesson.id)
    setIsCompleting(false)
  }

  const handleNextLesson = () => {
    if (nextLesson) {
      router.push(`/courses/${course.id}/lessons/${nextLesson.id}`)
    }
  }

  const handlePrevLesson = () => {
    if (prevLesson) {
      router.push(`/courses/${course.id}/lessons/${prevLesson.id}`)
    }
  }

  const handleQuizClick = () => {
    if (lesson.quizId) {
      router.push(`/courses/${course.id}/quizzes/${lesson.quizId}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-6">
          <Link href={`/courses/${course.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-0">
            {/* Video Player */}
            <div className="relative w-full aspect-video bg-black rounded-t-xl overflow-hidden">
              <iframe
                src={lesson.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.title}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                <p className="text-gray-400">{lesson.description}</p>
              </div>
              {lesson.completed && (
                <CheckCircle2 className="w-6 h-6 text-[#00ff88] flex-shrink-0 ml-4" />
              )}
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {!lesson.completed ? (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isCompleting}
                    className="bg-[#00ff88] text-[#002E20] flex-1"
                  >
                    {isCompleting ? "Marking..." : "Mark as Complete"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="flex-1 border-[#00ff88] text-[#00ff88]"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completed
                  </Button>
                )}

                {lesson.hasQuiz && lesson.quizId && (
                  <Button
                    onClick={handleQuizClick}
                    variant="outline"
                    className="flex-1"
                  >
                    <FileQuestion className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 gap-4">
          {prevLesson ? (
            <Button
              variant="outline"
              onClick={handlePrevLesson}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Lesson
            </Button>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Button
              onClick={handleNextLesson}
              className="bg-[#00ff88] text-[#002E20] flex items-center gap-2"
            >
              Next Lesson
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push(`/courses/${course.id}`)}
              className="flex items-center gap-2"
            >
              Back to Course
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
