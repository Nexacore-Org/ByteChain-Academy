"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { FileQuestion, Plus, Loader2 } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuizQuestionBlock, type QuizQuestionForm } from "./quiz-question-block"
import type { QuizData } from "@/hooks/use-lesson-quiz"
import { cn } from "@/lib/utils"

let sortIdCounter = 0
function nextSortId() {
  return `sort-${++sortIdCounter}`
}

interface QuizManagerPanelProps {
  open: boolean
  onClose: () => void
  lessonTitle: string
  lessonId: string
  quiz: QuizData | null
  loading: boolean
  error: string | null
  submitError: string | null
  submitLoading: boolean
  onRetry?: () => void
  onCreateQuiz: (payload: {
    title: string
    description?: string
    questions: { text: string; options: string[]; correctAnswer: string }[]
  }) => Promise<QuizData | null>
  onUpdateQuiz: (
    quizId: string,
    payload: {
      title?: string
      description?: string
      questions: { id?: string; text: string; options: string[]; correctAnswer: string }[]
    }
  ) => Promise<QuizData | null>
  onSuccess?: (hasQuiz: boolean) => void
}

export function QuizManagerPanel({
  open,
  onClose,
  lessonTitle,
  lessonId: _lessonId,
  quiz,
  loading,
  error,
  submitError,
  submitLoading,
  onRetry,
  onCreateQuiz,
  onUpdateQuiz,
  onSuccess,
}: QuizManagerPanelProps) {
  const [passingScore, setPassingScore] = useState(70)
  const [questions, setQuestions] = useState<Array<QuizQuestionForm & { _sortId?: string }>>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [successToast, setSuccessToast] = useState(false)

  const isEditMode = !!quiz

  useEffect(() => {
    if (quiz?.questions?.length) {
      setQuestions(
        quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
          _sortId: q.id || nextSortId(),
        }))
      )
    } else if (!quiz && open) {
      setQuestions([])
    }
    // Sync quiz prop to local questions state
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [quiz, open])

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: "",
        options: ["", ""],
        correctAnswer: "",
        _sortId: nextSortId(),
      },
    ])
  }

  const updateQuestion = (idx: number, q: QuizQuestionForm) => {
    setQuestions((prev) => {
      const next = [...prev]
      next[idx] = { ...q, _sortId: next[idx]._sortId }
      return next
    })
  }

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx))
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    questions.forEach((q, i) => {
      if (!q.text?.trim()) {
        errs[`q${i}-text`] = "Question text is required"
      }
      const opts = q.options.filter((o) => o.trim())
      if (opts.length < 2) {
        errs[`q${i}-options`] = "At least 2 options are required"
      }
      if (!q.correctAnswer?.trim()) {
        errs[`q${i}-correct`] = "Select the correct answer"
      } else if (!opts.includes(q.correctAnswer.trim())) {
        errs[`q${i}-correct`] = "Correct answer must be one of the options"
      }
    })
    setValidationErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    const payload = {
      title: `Quiz — ${lessonTitle}`,
      description: `Passing score: ${passingScore}%`,
      questions: questions
        .filter((q) => q.text.trim())
        .map((q) => ({
          id: q.id,
          text: q.text.trim(),
          options: q.options.filter((o) => o.trim()),
          correctAnswer: q.correctAnswer.trim(),
        })),
    }

    if (payload.questions.length === 0) {
      setValidationErrors({ form: "Add at least one question" })
      return
    }

    if (isEditMode && quiz) {
      const updated = await onUpdateQuiz(quiz.id, payload)
      if (updated) {
        onSuccess?.(true)
        setSuccessToast(true)
        setTimeout(() => setSuccessToast(false), 3000)
      }
    } else {
      const created = await onCreateQuiz(payload)
      if (created) {
        onSuccess?.(true)
        setSuccessToast(true)
        setTimeout(() => setSuccessToast(false), 3000)
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
    if (!event.over) return
    const oldIdx = questions.findIndex((q) => (q._sortId || q.id) === event.active.id)
    const newIdx = questions.findIndex((q) => (q._sortId || q.id) === event.over!.id)
    if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return
    setQuestions((prev) => arrayMove(prev, oldIdx, newIdx))
  }

  const sortIds = questions.map((q) => q._sortId || q.id || "").filter(Boolean)

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetContent
        title={`Quiz — ${lessonTitle}`}
        className="flex flex-col max-w-md"
      >
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-lg bg-white/5 animate-pulse"
                  aria-hidden
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && !quiz && questions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                <FileQuestion className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-gray-400 mb-2">No quiz yet.</p>
              <p className="text-sm text-gray-500 mb-6">Add questions to test your learners.</p>
              <Button
                onClick={() => {
                  addQuestion()
                }}
                className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>
          )}

          {!loading && !error && (quiz || questions.length > 0) && (
            <>
              {successToast && (
                <div className="rounded-lg border border-[#00ff88]/30 bg-[#00ff88]/10 p-3 text-[#00ff88] text-sm">
                  Quiz saved
                </div>
              )}
              {submitError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400 text-sm">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Passing score (%)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value) || 70)}
                  className="bg-white/5 border-white/10 w-24"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-400">Questions</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addQuestion}
                    disabled={submitLoading}
                    className="text-[#00ff88] hover:text-[#00ff88]/80"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Question
                  </Button>
                </div>

                {validationErrors.form && (
                  <p className="text-red-400 text-sm mb-2">{validationErrors.form}</p>
                )}

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={sortIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {questions.map((q, i) => (
                        <QuizQuestionBlock
                          key={(q as { _sortId?: string })._sortId || q.id || i}
                          question={q}
                          index={i}
                          disabled={submitLoading}
                          onQuestionChange={(updated) => updateQuestion(i, updated)}
                          onRemove={() => removeQuestion(i)}
                          canRemove={questions.length > 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </>
          )}
        </div>

        {!loading && !error && (quiz || questions.length > 0) && (
          <div className="px-6 py-4 border-t border-white/10">
            <Button
              onClick={handleSave}
              disabled={submitLoading || questions.length === 0}
              className={cn(
                "w-full",
                isEditMode
                  ? "bg-[#00ff88]/20 text-[#00ff88] hover:bg-[#00ff88]/30"
                  : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              )}
            >
              {submitLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isEditMode ? "Update Quiz" : "Save Quiz"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
