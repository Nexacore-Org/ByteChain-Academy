"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CourseTable } from "@/components/admin/course-table";
import { CreateCourseModal } from "@/components/admin/create-course-modal";
import {
  fetchAdminCourses,
  createAdminCourse,
  deleteAdminCourse,
  type AdminCourse,
  type CreateCoursePayload,
} from "@/lib/api";

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminCourse | null>(null);

  const PAGE_SIZE = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "courses", page, search, status],
    queryFn: () => fetchAdminCourses(page, search, status),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createAdminCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      setShowCreate(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      setConfirmDelete(null);
    },
  });

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((s: string) => {
    setStatus(s);
    setPage(1);
  }, []);

  const handleCreate = async (payload: CreateCoursePayload) => {
    await createMutation.mutateAsync(payload);
  };

  const handleDeleteConfirm = () => {
    if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage all courses.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Table */}
      <CourseTable
        courses={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onEdit={(course) => {
          // Edit handled inline — extend with an EditModal if needed
          alert(`Edit: ${course.title} (id: ${course.id})`);
        }}
        onDelete={(course) => setConfirmDelete(course)}
        isLoading={isLoading}
      />

      {/* Create Course Modal */}
      <CreateCourseModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold">Delete Course?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong>&ldquo;{confirmDelete.title}&rdquo;</strong>? This action
              cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
