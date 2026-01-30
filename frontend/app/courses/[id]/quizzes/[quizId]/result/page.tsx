"use client"

import { use } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLearning } from "@/contexts/learning-context"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, BookOpen } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function QuizResultPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>
}) {
  const { id, quizId } = use(params)
  const { courses, quizResults, getQuiz } = useLearning()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const course = courses.find((c) => c.id === id)
  const quiz = getQuiz(quizId)
  const result = quizResults[quizId]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Please sign in to view quiz results</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </main>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Quiz not found</h1>
          <Link href={course ? `/courses/${course.id}` : "/dashboard"}>
            <Button variant="outline">Back</Button>
          </Link>
        </main>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">No quiz result found</h1>
          <p className="text-gray-400 mb-6">Please complete the quiz first.</p>
          <Link href={`/courses/${id}/quizzes/${quizId}`}>
            <Button>Take Quiz</Button>
          </Link>
        </main>
      </div>
    )
  }

  const handleRetry = () => {
    router.push(`/courses/${id}/quizzes/${quizId}`)
  }

  const handleContinue = () => {
    if (course) {
      router.push(`/courses/${course.id}`)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="mb-6">
          <Link href={course ? `/courses/${course.id}` : "/dashboard"}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <Card className={`mb-6 ${result.passed ? "border-[#00ff88]/30" : "border-red-500/30"}`}>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              {result.passed ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-[#00ff88]/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-12 h-12 text-[#00ff88]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[#00ff88] mb-2">Quiz Passed!</h2>
                  <p className="text-gray-400">Congratulations! You've successfully completed the quiz.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-red-500 mb-2">Quiz Not Passed</h2>
                  <p className="text-gray-400">
                    You need at least 70% to pass. Don't worry, you can retry!
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-5xl font-bold mb-2">
                  {Math.round(result.score)}%
                </div>
                <p className="text-gray-400">
                  You got {Math.round((result.score / 100) * result.totalQuestions)} out of{" "}
                  {result.totalQuestions} questions correct
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <span>Submitted on</span>
                  <span className="text-white">
                    {new Date(result.submittedAt).toLocaleDateString()} at{" "}
                    {new Date(result.submittedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          {!result.passed && (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </Button>
          )}
          <Button
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center gap-2 ${
              result.passed
                ? "bg-[#00ff88] text-[#002E20]"
                : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {result.passed ? "Continue Learning" : "Back to Course"}
          </Button>
        </div>
      </main>
    </div>
  )
}
