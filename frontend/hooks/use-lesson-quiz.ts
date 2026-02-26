"use client"

import { useState, useCallback } from "react"
import { api } from "@/lib/api"

export interface QuizQuestion {
  id?: string
  text: string
  options: string[]
  correctAnswer: string // option text, matching backend
}

export interface QuizData {
  id: string
  title: string
  description?: string
  lessonId: string
  questions: QuizQuestion[]
}

export function useLessonQuiz(lessonId: string | null, lessonTitle: string) {
  const [isOpen, setIsOpen] = useState(false)
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchQuiz = useCallback(async () => {
    if (!lessonId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<QuizData>(`/quizzes/lesson/${lessonId}`)
      setQuiz(data)
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 404) {
        setQuiz(null)
      } else {
        setError("Failed to load quiz")
      }
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  const open = useCallback(() => {
    setIsOpen(true)
    if (lessonId) fetchQuiz()
  }, [lessonId, fetchQuiz])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuiz(null)
    setError(null)
    setSubmitError(null)
  }, [])

  const createQuiz = useCallback(
    async (payload: {
      title: string
      description?: string
      questions: { text: string; options: string[]; correctAnswer: string }[]
    }) => {
      if (!lessonId) return null
      setSubmitLoading(true)
      setSubmitError(null)
      try {
        const created = await api.post<QuizData>("/quizzes", {
          title: payload.title || `Quiz — ${lessonTitle}`,
          description: payload.description || "",
          lessonId,
          questions: payload.questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        })
        setQuiz(created)
        return created
      } catch {
        setSubmitError("Failed to save quiz")
        return null
      } finally {
        setSubmitLoading(false)
      }
    },
    [lessonId, lessonTitle]
  )

  const updateQuiz = useCallback(
    async (quizId: string, payload: {
      title?: string
      description?: string
      questions: { id?: string; text: string; options: string[]; correctAnswer: string }[]
    }) => {
      setSubmitLoading(true)
      setSubmitError(null)
      try {
        const updated = await api.patch<QuizData>(`/quizzes/${quizId}`, {
          title: payload.title,
          description: payload.description,
          questions: payload.questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
        })
        setQuiz(updated)
        return updated
      } catch {
        setSubmitError("Failed to update quiz")
        return null
      } finally {
        setSubmitLoading(false)
      }
    },
    []
  )

  const onQuizSaved = useCallback(() => {
    // Callback for parent to update lesson row badge
  }, [])

  return {
    isOpen,
    open,
    close,
    quiz,
    loading,
    error,
    submitError,
    submitLoading,
    fetchQuiz,
    createQuiz,
    updateQuiz,
  }
}
