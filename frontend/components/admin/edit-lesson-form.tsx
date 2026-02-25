"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileQuestion, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface EditLessonFormProps {
  lessonId: string
  open: boolean
  onClose: () => void
  onSaved: () => void
  onQuizClick: (lessonId: string, title: string) => void
}

interface Lesson {
  id: string
  title: string
  content: string
  videoUrl?: string
  order: number
}

interface Quiz {
  id: string
  questions: { id: string }[]
}

export function EditLessonForm({
  lessonId,
  open,
  onClose,
  onSaved,
  onQuizClick,
}: EditLessonFormProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasQuiz = !!quiz
  const questionCount = quiz?.questions?.length ?? 0

  useEffect(() => {
    if (!open || !lessonId) return
    setLoading(true)
    setError(null)
    Promise.all([
      api.get<Lesson>(`/lessons/${lessonId}`),
      api.get<Quiz>(`/quizzes/lesson/${lessonId}`).catch(() => null),
    ])
      .then(([l, q]) => {
        setLesson(l)
        setQuiz(q)
        setTitle(l.title)
        setContent(l.content)
      })
      .catch(() => setError("Failed to load lesson"))
      .finally(() => setLoading(false))
  }, [open, lessonId])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/lessons/${lessonId}`, { title, content })
      onSaved()
      onClose()
    } catch {
      setError("Failed to update lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setLesson(null)
    setQuiz(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          )}
          {!loading && (
            <>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lesson title"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Lesson content"
                  rows={4}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00ff88]"
                />
              </div>

              <div className="rounded-lg border border-white/10 p-4 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">Quiz</p>
                      <p className="text-sm text-gray-500">
                        {hasQuiz
                          ? `${questionCount} question${questionCount !== 1 ? "s" : ""}`
                          : "No quiz attached"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => lessonId && onQuizClick(lessonId, title || lesson?.title || "")}
                    className="hover:border-[#00ff88]/50 hover:text-[#00ff88] border-white/20"
                  >
                    {hasQuiz ? "Edit Quiz" : "+ Add Quiz"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !title.trim() || !content.trim()}
                  className="bg-[#00ff88] text-[#002E20]"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
