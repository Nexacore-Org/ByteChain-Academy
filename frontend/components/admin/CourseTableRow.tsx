"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteCourseDialog } from "./DeleteCourseDialog";
import { deleteAdminCourse, type AdminCourse } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CourseTableRowProps {
  course: AdminCourse;
  onDeleted: (id: string) => void;
}

export function CourseTableRow({ course, onDeleted }: CourseTableRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDeleteClick = () => {
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAdminCourse(course.id);
      setIsExiting(true);
      // Fade-out animation (CSS handles it)
      await new Promise((r) => setTimeout(r, 300));
      onDeleted(course.id);
      toast.success("Course deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteButton = course.published ? (
    <button
      type="button"
      onClick={handleDeleteClick}
      title="Unpublish the course before deleting"
      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-help"
      aria-label="Delete course (unpublish first)"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  ) : (
    <button
      type="button"
      onClick={handleDeleteClick}
      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      aria-label="Delete course"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  return (
    <>
      <tr
        className={cn(
          "border-b border-white/10 transition-opacity duration-300",
          isExiting && "opacity-0"
        )}
      >
        <td className="py-4 px-4">
          <div className="font-medium text-white">{course.title}</div>
          <div className="text-sm text-gray-400 line-clamp-1">{course.description}</div>
        </td>
        <td className="py-4 px-4">
          <span
            className={cn(
              "inline-flex px-2 py-1 rounded-full text-xs font-medium",
              course.published
                ? "bg-[#00ff88]/20 text-[#00ff88]"
                : "bg-amber-500/20 text-amber-400"
            )}
          >
            {course.published ? "Published" : "Draft"}
          </span>
        </td>
        <td className="py-4 px-4 text-gray-400 text-sm">
          {new Date(course.updatedAt).toLocaleDateString()}
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <Link href={`/admin/courses/${course.id}/edit`}>
              <button
                type="button"
                className="p-2 rounded-lg text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/10 transition-colors"
                aria-label="Edit course"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </Link>
            {deleteButton}
            <Link href={`/admin/courses/${course.id}/lessons`}>
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Lessons
              </Button>
            </Link>
          </div>
        </td>
      </tr>
      <DeleteCourseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        courseTitle={course.title}
        isPublished={course.published}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
