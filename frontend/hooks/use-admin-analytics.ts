"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsOverview,
  fetchCoursePerformance,
  fetchLearnerActivity,
  fetchTopLearners,
} from "@/lib/api";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: fetchAnalyticsOverview,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCoursePerformance() {
  return useQuery({
    queryKey: ["admin", "analytics", "course-performance"],
    queryFn: fetchCoursePerformance,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLearnerActivity() {
  return useQuery({
    queryKey: ["admin", "analytics", "learner-activity"],
    queryFn: fetchLearnerActivity,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopLearners() {
  return useQuery({
    queryKey: ["admin", "analytics", "top-learners"],
    queryFn: fetchTopLearners,
    staleTime: 5 * 60 * 1000,
  });
}
