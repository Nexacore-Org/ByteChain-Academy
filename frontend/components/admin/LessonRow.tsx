"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminLesson } from "@/lib/api";

interface LessonRowProps {
  lesson: AdminLesson;
  index: number;
  disabled?: boolean;
}

export function LessonRow({ lesson, index, disabled }: LessonRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-white/10 transition-all",
        isDragging && "opacity-60 shadow-lg bg-white/5 z-10"
      )}
    >
      <td className="py-3 px-4 w-10">
        {!disabled && (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing p-2 -ml-2 rounded text-gray-400 hover:text-white hover:bg-white/5"
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${lesson.title}`}
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 flex items-center justify-center text-sm font-semibold text-[#00ff88]">
          {String(index + 1).padStart(2, "0")}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-medium text-white">{lesson.title}</span>
      </td>
      <td className="py-3 px-4 text-gray-400 text-sm">
        {lesson.order}
      </td>
    </tr>
  );
}
