"use client"

import { useState, useEffect, useCallback } from "react"
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
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLessons = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    setError(null)
    try {
      const list = await api.get<{ id: string; title: string; content: string; videoUrl: string | null; videoStartTimestamp: number | null; order: number; courseId: string }[]>(
        `/lessons/course/${courseId}`
      )
      const withQuiz = await Promise.all(
        list.map(async (l) => {
          try {
            await api.get(`/quizzes/lesson/${l.id}`)
            return { ...l, hasQuiz: true }
          } catch {
            return { ...l, hasQuiz: false }
          }
        })
      )
      setLessons(withQuiz.sort((a, b) => a.order - b.order))
    } catch {
      setError("Failed to load lessons")
      setLessons([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  const updateLessonHasQuiz = useCallback((lessonId: string, hasQuiz: boolean) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, hasQuiz } : l))
    )
  }, [])

  return { lessons, loading, error, refetch: fetchLessons, updateLessonHasQuiz }
}
