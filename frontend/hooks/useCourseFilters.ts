"use client";

import { useState, useCallback, useEffect } from "react";
import {
  fetchAdminCourses,
  type AdminCourse,
  type PaginatedCourses,
} from "@/lib/api";

export type StatusFilter = "" | "published" | "draft";

export interface UseCourseFiltersResult {
  courses: AdminCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  status: StatusFilter;
  isLoading: boolean;
  searchIsLoading: boolean;
  setSearch: (s: string) => void;
  setStatus: (s: StatusFilter) => void;
  setPage: (p: number) => void;
  refetch: () => Promise<void>;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
}

export function useCourseFilters(initialLimit = 10): UseCourseFiltersResult {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchIsLoading, setSearchIsLoading] = useState(false);

  // Debounce search by 300ms
  useEffect(() => {
    setSearchIsLoading(!!search);
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setSearchIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Parameters<typeof fetchAdminCourses>[0] = {
        page,
        limit,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;

      const result: PaginatedCourses = await fetchAdminCourses(params);
      setCourses(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);

      // Display counts: when filtered, active filter shows result total
      if (status === "published") {
        setTotalCount(result.total);
        setPublishedCount(result.total);
        setDraftCount(result.data.filter((c) => !c.published).length);
      } else if (status === "draft") {
        setTotalCount(result.total);
        setPublishedCount(result.data.filter((c) => c.published).length);
        setDraftCount(result.total);
      } else {
        setTotalCount(result.total);
        setPublishedCount(result.data.filter((c) => c.published).length);
        setDraftCount(result.data.filter((c) => !c.published).length);
      }
    } catch (err) {
      setCourses([]);
      setTotal(0);
      setTotalPages(0);
      setTotalCount(0);
      setPublishedCount(0);
      setDraftCount(0);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, status, page, limit]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  return {
    courses,
    total,
    page,
    limit,
    totalPages,
    search,
    status,
    isLoading,
    searchIsLoading,
    setSearch,
    setStatus,
    setPage,
    refetch: load,
    totalCount,
    publishedCount,
    draftCount,
  };
}
