"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { LessonRow } from "@/components/admin/LessonRow";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowLeft, Plus } from "lucide-react";
import { fetchLessonsByCourse, reorderLessons, type AdminLesson } from "@/lib/api";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminLessonsPage({ params }: PageProps) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  const loadLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLessonsByCourse(courseId);
      setLessons(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load lessons");
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(lessons, oldIndex, newIndex);
    const previousOrder = [...lessons];

    setLessons(newOrder);
    setIsReordering(true);

    try {
      await reorderLessons(
        courseId,
        newOrder.map((l) => l.id)
      );
    } catch (err) {
      setLessons(previousOrder);
      toast.error(err instanceof Error ? err.message : "Failed to reorder lessons");
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/admin/courses`}>
            <button
              type="button"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Courses
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Lessons</h1>
          <Link href={`/admin/courses/${courseId}/lessons/new`}>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ff88] text-[#002E20] font-medium hover:bg-[#00d88b] transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Lesson
            </button>
          </Link>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0b1327]/30 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="w-10 py-3 px-4" aria-hidden />
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  #
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                  Order
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    No lessons yet
                  </td>
                </tr>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={lessons.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {lessons.map((lesson, index) => (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        disabled={isReordering}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
