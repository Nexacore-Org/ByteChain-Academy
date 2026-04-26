"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface AdminLesson {
  id: string
  title: string
  content: string
  videoUrl: string | null
  videoStartTimestamp: number | null
  order: number
  courseId: string
  hasQuiz: boolean
}

export interface AdminCourse {
  id: string
  title: string
  description: string
  published: boolean
}

export function useAdminLessons(courseId: string | null) {
  const queryClient = useQueryClient()
  const lessonsKey = ["lessons", courseId]

  const lessonsQuery = useQuery({
    queryKey: lessonsKey,
    enabled: Boolean(courseId),
    queryFn: async () => {
      const list = await api.get<
        {
          id: string
          title: string
          content: string
          videoUrl: string | null
          videoStartTimestamp: number | null
          order: number
          courseId: string
        }[]
      >(`/lessons/course/${courseId}`)

      const withQuiz = await Promise.all(
        list.map(async (lesson) => {
          try {
            await api.get(`/quizzes/lesson/${lesson.id}`)
            return { ...lesson, hasQuiz: true }
          } catch {
            return { ...lesson, hasQuiz: false }
          }
        })
      )
      return withQuiz.sort((a, b) => a.order - b.order)
    },
  })

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      await api.delete(`/lessons/${lessonId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonsKey })
    },
  })

  const createLessonMutation = useMutation({
    mutationFn: async (payload: {
      title: string
      content: string
      videoUrl?: string | null
      videoStartTimestamp?: number | null
    }) => {
      if (!courseId) return null
      return api.post<AdminLesson>("/lessons", {
        ...payload,
        courseId,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonsKey })
    },
  })

  const updateLessonMutation = useMutation({
    mutationFn: async (payload: {
      lessonId: string
      title?: string
      content?: string
      videoUrl?: string | null
      videoStartTimestamp?: number | null
      order?: number
    }) => {
      const { lessonId, ...body } = payload
      return api.patch<AdminLesson>(`/lessons/${lessonId}`, body)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonsKey })
    },
  })

  const updateLessonHasQuiz = (lessonId: string, hasQuiz: boolean) => {
    queryClient.setQueryData<AdminLesson[]>(lessonsKey, (prev = []) =>
      prev.map((lesson) => (lesson.id === lessonId ? { ...lesson, hasQuiz } : lesson))
    )
  }

  return {
    lessons: lessonsQuery.data ?? [],
    loading: lessonsQuery.isLoading,
    error: lessonsQuery.isError ? "Failed to load lessons" : null,
    refetch: lessonsQuery.refetch,
    deleteLesson: deleteLessonMutation.mutateAsync,
    createLesson: createLessonMutation.mutateAsync,
    updateLesson: updateLessonMutation.mutateAsync,
    isDeletingLesson: deleteLessonMutation.isPending,
    isCreatingLesson: createLessonMutation.isPending,
    isUpdatingLesson: updateLessonMutation.isPending,
    updateLessonHasQuiz,
  }
}
