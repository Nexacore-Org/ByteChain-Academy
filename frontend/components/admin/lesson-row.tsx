"use client"

import { FileQuestion, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LessonRowProps {
  lesson: {
    id: string
    title: string
    order: number
    hasQuiz: boolean
  }
  onQuizClick: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function LessonRow({
  lesson,
  onQuizClick,
  onEdit,
  onDelete,
}: LessonRowProps) {
  const hasQuiz = lesson.hasQuiz

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg border border-white/10 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm font-medium text-gray-400 w-8 shrink-0">
          {String(lesson.order + 1).padStart(2, "0")}
        </span>
        <span className="font-medium text-white truncate">{lesson.title}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onQuizClick()
          }}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
            hasQuiz
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
              : "bg-transparent text-gray-500 border border-dashed border-gray-500/50 hover:border-gray-400/50 hover:text-gray-400"
          )}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          {hasQuiz ? "Quiz" : "+ Quiz"}
        </button>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-gray-400 hover:text-white"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
