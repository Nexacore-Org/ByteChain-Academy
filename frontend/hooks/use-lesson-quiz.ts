"use client"

import { useState, useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const quizKey = ["lesson-quiz", lessonId]

  const quizQuery = useQuery({
    queryKey: quizKey,
    enabled: Boolean(lessonId) && isOpen,
    queryFn: async () => {
      return api.get<QuizData>(`/quizzes/lesson/${lessonId}`)
    },
    retry: false,
  })

  const fetchQuiz = useCallback(async () => {
    if (!lessonId) return null
    try {
      const result = await quizQuery.refetch()
      return result.data ?? null
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 404) {
        return null
      }
      throw err
    }
  }, [lessonId, quizQuery])

  const open = useCallback(() => {
    setIsOpen(true)
    if (lessonId) fetchQuiz()
  }, [lessonId, fetchQuiz])

  const close = useCallback(() => {
    setIsOpen(false)
    setSubmitError(null)
  }, [])

  const createQuizMutation = useMutation({
    mutationFn: async (payload: {
      title: string
      description?: string
      questions: { text: string; options: string[]; correctAnswer: string }[]
    }) => {
      if (!lessonId) return null
      return api.post<QuizData>("/quizzes", {
        title: payload.title || `Quiz — ${lessonTitle}`,
        description: payload.description || "",
        lessonId,
        questions: payload.questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      })
    },
    onSuccess: (created) => {
      if (created) {
        queryClient.setQueryData(quizKey, created)
      }
    },
  })

  const updateQuizMutation = useMutation({
    mutationFn: async (variables: {
      quizId: string
      payload: {
      title?: string
      description?: string
      questions: { id?: string; text: string; options: string[]; correctAnswer: string }[]
      }
    }) => {
      const { quizId, payload } = variables
      return api.patch<QuizData>(`/quizzes/${quizId}`, {
        title: payload.title,
        description: payload.description,
        questions: payload.questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(quizKey, updated)
    },
  })

  const createQuiz = useCallback(
    async (payload: {
      title: string
      description?: string
      questions: { text: string; options: string[]; correctAnswer: string }[]
    }) => {
      setSubmitError(null)
      try {
        return await createQuizMutation.mutateAsync(payload)
      } catch {
        setSubmitError("Failed to save quiz")
        return null
      }
    },
    [createQuizMutation]
  )

  const updateQuiz = useCallback(
    async (
      quizId: string,
      payload: {
        title?: string
        description?: string
        questions: { id?: string; text: string; options: string[]; correctAnswer: string }[]
      }
    ) => {
      setSubmitError(null)
      try {
        return await updateQuizMutation.mutateAsync({ quizId, payload })
      } catch {
        setSubmitError("Failed to update quiz")
        return null
      }
    },
    [updateQuizMutation]
  )

  return {
    isOpen,
    open,
    close,
    quiz: quizQuery.data ?? null,
    loading: quizQuery.isLoading,
    error: quizQuery.isError ? "Failed to load quiz" : null,
    submitError,
    submitLoading: createQuizMutation.isPending || updateQuizMutation.isPending,
    fetchQuiz,
    createQuiz,
    updateQuiz,
  }
}
