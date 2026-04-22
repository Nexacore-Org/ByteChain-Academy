"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileQuestion, Plus } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface NewLessonFormProps {
  courseId: string
  open: boolean
  onClose: () => void
  onSaved: () => void
  onQuizClick: (lessonId: string, title: string) => void
}

export function NewLessonForm({
  courseId,
  open,
  onClose,
  onSaved,
  onQuizClick,
}: NewLessonFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedLessonId, setSavedLessonId] = useState<string | null>(null)

  const isLocked = !savedLessonId

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const lesson = await api.post<{ id: string }>("/lessons", {
        title,
        content,
        courseId,
      })
      setSavedLessonId(lesson.id)
    } catch {
      setError("Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (savedLessonId) {
      onSaved(savedLessonId)
    }
    setTitle("")
    setContent("")
    setSavedLessonId(null)
    setError(null)
    onClose()
  }

  const handleFinalSave = () => {
    if (savedLessonId) {
      onSaved(savedLessonId)
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Lesson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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

          <div
            className={cn(
              "rounded-lg border p-4",
              isLocked
                ? "border-white/5 bg-white/[0.02] opacity-60"
                : "border-white/10 bg-white/[0.02]"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-white">Quiz</p>
                  <p className="text-sm text-gray-500">
                    {isLocked ? "Save lesson first to add a quiz" : "No quiz attached"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  !isLocked && savedLessonId && onQuizClick(savedLessonId, title)
                }
                disabled={isLocked}
                className={cn(
                  "border-white/20",
                  !isLocked && "hover:border-[#00ff88]/50 hover:text-[#00ff88]"
                )}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Quiz
              </Button>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {!savedLessonId ? (
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
                className="bg-[#00ff88] text-[#002E20]"
              >
                {saving ? "Saving…" : "Save Lesson"}
              </Button>
            ) : (
              <Button
                onClick={handleFinalSave}
                className="bg-[#00ff88] text-[#002E20]"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
