"use client"

import { use, useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { LessonRow } from "@/components/admin/lesson-row"
import { QuizManagerPanel } from "@/components/admin/quiz-manager-panel"
import { useAdminLessons } from "@/hooks/use-admin-lessons"
import { useLessonQuiz } from "@/hooks/use-lesson-quiz"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { NewLessonForm } from "@/components/admin/new-lesson-form"
import { EditLessonForm } from "@/components/admin/edit-lesson-form"

export default function AdminLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = use(params)
  const { lessons, loading, error, refetch, updateLessonHasQuiz } =
    useAdminLessons(courseId)

  const [newFormOpen, setNewFormOpen] = useState(false)
  const [editLessonId, setEditLessonId] = useState<string | null>(null)

  const [quizPanel, setQuizPanel] = useState<{ lessonId: string; title: string } | null>(null)
  const quiz = useLessonQuiz(quizPanel?.lessonId ?? null, quizPanel?.title ?? "")

  const openQuizPanel = (lessonId: string, title: string) => {
    setQuizPanel({ lessonId, title })
  }

  const closeQuizPanel = () => {
    setQuizPanel(null)
    quiz.close()
  }

  const handleQuizSuccess = (hasQuiz: boolean) => {
    if (quizPanel?.lessonId) updateLessonHasQuiz(quizPanel.lessonId, hasQuiz)
  }

  useEffect(() => {
    if (quizPanel && !quiz.isOpen) {
      quiz.open()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open when quizPanel is set
  }, [quizPanel])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Button
          onClick={() => setNewFormOpen(true)}
          className="bg-[#00ff88] text-[#002E20] hover:bg-[#00ff88]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Lesson
        </Button>
      </div>

      {error && (
        <p className="text-red-400 mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading lessons…</p>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={{
                id: lesson.id,
                title: lesson.title,
                order: lesson.order,
                hasQuiz: lesson.hasQuiz,
              }}
              onQuizClick={() => openQuizPanel(lesson.id, lesson.title)}
              onEdit={() => setEditLessonId(lesson.id)}
              onDelete={async () => {
                if (!confirm("Delete this lesson?")) return
                try {
                  await api.delete(`/lessons/${lesson.id}`)
                  if (editLessonId === lesson.id) setEditLessonId(null)
                  refetch()
                } catch {
                  // Error - could show toast
                }
              }}
            />
          ))}
        </div>
      )}

      <QuizManagerPanel
        open={quiz.isOpen}
        onClose={closeQuizPanel}
        lessonTitle={quizPanel?.title ?? ""}
        lessonId={quizPanel?.lessonId ?? ""}
        quiz={quiz.quiz}
        loading={quiz.loading}
        error={quiz.error}
        submitError={quiz.submitError}
        submitLoading={quiz.submitLoading}
        onRetry={quiz.fetchQuiz}
        onCreateQuiz={quiz.createQuiz}
        onUpdateQuiz={quiz.updateQuiz}
        onSuccess={handleQuizSuccess}
      />

      <NewLessonForm
        courseId={courseId}
        open={newFormOpen}
        onClose={() => setNewFormOpen(false)}
        onSaved={() => {
          setNewFormOpen(false)
          refetch()
        }}
        onQuizClick={(lessonId, title) => openQuizPanel(lessonId, title)}
      />

      {editLessonId && (
        <EditLessonForm
          lessonId={editLessonId}
          open={!!editLessonId}
          onClose={() => setEditLessonId(null)}
          onSaved={() => {
            setEditLessonId(null)
            refetch()
          }}
          onQuizClick={(lid, title) => openQuizPanel(lid, title)}
        />
      )}
    </div>
  )
}
