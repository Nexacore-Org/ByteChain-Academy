"use client"

import { use, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLearning } from "@/contexts/learning-context"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>
}) {
  const { id, quizId } = use(params)
  const { courses, getQuiz, submitQuiz } = useLearning()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const course = courses.find((c) => c.id === id)
  const quiz = getQuiz(quizId)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Please sign in to take quizzes</h1>
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

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    const allAnswered = quiz.questions.every((q) => selectedAnswers[q.id] !== undefined)
    if (!allAnswered) {
      alert("Please answer all questions before submitting.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = submitQuiz(quiz.id, selectedAnswers)
      // Navigate to results page
      router.push(`/courses/${id}/quizzes/${quizId}/result`)
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("An error occurred while submitting the quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const allAnswered = quiz.questions.every((q) => selectedAnswers[q.id] !== undefined)

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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl mb-2">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-gray-400">{quiz.description}</p>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-6 mb-6">
          {quiz.questions.map((question, questionIndex) => (
            <Card key={question.id}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">
                    Question {questionIndex + 1} of {quiz.questions.length}
                  </h3>
                  <p className="text-white text-lg">{question.question}</p>
                </div>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[question.id] === optionIndex
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(question.id, optionIndex)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          isSelected
                            ? "border-[#00ff88] bg-[#00ff88]/10"
                            : "border-white/10 bg-[#1a1a1a] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-[#00ff88] bg-[#00ff88]"
                                : "border-gray-600"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-[#002E20]" />
                            )}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {Object.keys(selectedAnswers).length} of {quiz.questions.length} questions answered
                </p>
                {!allAnswered && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Please answer all questions before submitting
                  </p>
                )}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="bg-[#00ff88] text-[#002E20]"
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
