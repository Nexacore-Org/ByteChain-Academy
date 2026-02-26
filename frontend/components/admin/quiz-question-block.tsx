"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface QuizQuestionForm {
  id?: string
  text: string
  options: string[]
  correctAnswer: string
}

interface QuizQuestionBlockProps {
  question: QuizQuestionForm
  index: number
  disabled?: boolean
  onQuestionChange: (q: QuizQuestionForm) => void
  onRemove: () => void
  canRemove: boolean
}

export function QuizQuestionBlock({
  question,
  index,
  disabled,
  onQuestionChange,
  onRemove,
  canRemove,
}: QuizQuestionBlockProps) {
  const sortId = (question as { _sortId?: string })._sortId || question.id || `q-${index}`
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const addOption = () => {
    if (question.options.length >= 6) return
    onQuestionChange({
      ...question,
      options: [...question.options, ""],
    })
  }

  const removeOption = (i: number) => {
    if (question.options.length <= 2) return
    const next = question.options.filter((_, j) => j !== i)
    const correctIdx = question.options.indexOf(question.correctAnswer)
    let newCorrect = question.correctAnswer
    if (correctIdx === i) {
      newCorrect = next[0] || ""
    } else if (correctIdx > i) {
      newCorrect = next[correctIdx - 1] || ""
    }
    onQuestionChange({ ...question, options: next, correctAnswer: newCorrect })
  }

  const updateOption = (i: number, value: string) => {
    const next = [...question.options]
    const oldCorrectOption = question.options[i]
    next[i] = value
    let newCorrect = question.correctAnswer
    if (question.correctAnswer === oldCorrectOption && i === question.options.indexOf(question.correctAnswer)) {
      newCorrect = value
    }
    onQuestionChange({ ...question, options: next, correctAnswer: newCorrect })
  }

  const setCorrect = (optionText: string) => {
    onQuestionChange({ ...question, correctAnswer: optionText })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.02] p-4",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2 mb-3">
        <button
          type="button"
          className="mt-1.5 p-1 rounded text-gray-400 hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <Input
            placeholder={`Question ${index + 1}`}
            value={question.text}
            onChange={(e) =>
              onQuestionChange({ ...question, text: e.target.value })
            }
            disabled={disabled}
            className="bg-white/5 border-white/10"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove || disabled}
          className="text-gray-400 hover:text-red-400"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 ml-6">
        {question.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correct-${sortId}`}
              checked={question.correctAnswer === opt}
              onChange={() => setCorrect(opt || question.options[i])}
              disabled={disabled}
              className="w-4 h-4 text-[#00ff88] border-white/20"
            />
            <Input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              disabled={disabled}
              className="flex-1 bg-white/5 border-white/10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(i)}
              disabled={question.options.length <= 2 || disabled}
              className="text-gray-400 hover:text-red-400 shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {question.options.length < 6 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addOption}
            disabled={disabled}
            className="text-gray-400 hover:text-[#00ff88]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Option
          </Button>
        )}
      </div>
    </div>
  )
}
