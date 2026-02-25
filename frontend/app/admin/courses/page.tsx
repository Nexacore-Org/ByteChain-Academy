"use client";

import { Header } from "@/components/header";
import { CourseSearchInput } from "@/components/admin/CourseSearchInput";
import { CourseStatCards } from "@/components/admin/CourseStatCards";
import { CourseTableRow } from "@/components/admin/CourseTableRow";
import { CoursePagination } from "@/components/admin/CoursePagination";
import { useCourseFilters } from "@/hooks/useCourseFilters";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";

export default function AdminCoursesPage() {
  const {
    courses,
    page,
    totalPages,
    search,
    status,
    isLoading,
    searchIsLoading,
    setSearch,
    setStatus,
    setPage,
    refetch,
    totalCount,
    publishedCount,
    draftCount,
  } = useCourseFilters(10);

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleCourseDeleted = async () => {
    await refetch();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Courses</h1>
          <Link href="/admin/courses/new">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[#00ff88] text-[#002E20] font-medium hover:bg-[#00d88b] transition-colors"
            >
              New Course
            </button>
          </Link>
        </div>

        <div className="mb-6">
          <CourseSearchInput
            value={search}
            onChange={setSearch}
            onClear={handleClearSearch}
            isLoading={searchIsLoading}
          />
        </div>

        <div className="mb-6">
          <CourseStatCards
            totalCount={totalCount}
            publishedCount={publishedCount}
            draftCount={draftCount}
            activeFilter={status}
            onFilterChange={(s) => {
              setStatus(s);
              setPage(1);
            }}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0b1327]/30 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                  Course
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                  Updated
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">
                  ACTIONS
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
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    {search ? (
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-12 h-12 text-gray-500" />
                        <p className="text-gray-400">
                          No courses match &quot;{search}&quot;
                        </p>
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="text-[#00ff88] hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="w-12 h-12 text-gray-500" />
                        <p className="text-gray-400">No courses yet</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <CourseTableRow
                    key={course.id}
                    course={course}
                    onDeleted={handleCourseDeleted}
                  />
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && courses.length > 0 && (
            <div className="p-4 border-t border-white/10">
              <CoursePagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
