const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  certificatesIssued: number;
}

export interface CoursePerformance {
  courseId: string;
  title: string;
  enrollments: number;
  completionRate: number;
}

export interface DailyActivity {
  date: string;
  activeUsers: number;
}

export interface TopLearner {
  userId: string;
  name: string;
  coursesCompleted: number;
  points: number;
}

export const fetchAnalyticsOverview = () =>
  apiFetch<AnalyticsOverview>("/admin/analytics/overview");

export const fetchCoursePerformance = () =>
  apiFetch<CoursePerformance[]>("/admin/analytics/course-performance");

export const fetchLearnerActivity = () =>
  apiFetch<DailyActivity[]>("/admin/analytics/learner-activity");

export const fetchTopLearners = () =>
  apiFetch<TopLearner[]>("/admin/analytics/top-learners");

// ─── Admin Courses ─────────────────────────────────────────────────────────────

export type CourseStatus = "published" | "draft" | "archived";
export type CourseDifficulty = "beginner" | "intermediate" | "advanced";

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  difficulty: CourseDifficulty;
  tags: string[];
  enrollmentCount: number;
  createdAt: string;
}

export interface PaginatedCourses {
  data: AdminCourse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  difficulty: CourseDifficulty;
  tags: string[];
}

export const fetchAdminCourses = (page = 1, search = "", status = "") =>
  apiFetch<PaginatedCourses>(
    `/admin/courses?page=${page}&search=${encodeURIComponent(search)}&status=${status}`,
  );

export const createAdminCourse = (payload: CreateCoursePayload) =>
  apiFetch<AdminCourse>("/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAdminCourse = (id: string, payload: Partial<CreateCoursePayload & { status: CourseStatus }>) =>
  apiFetch<AdminCourse>(`/admin/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteAdminCourse = (id: string) =>
  apiFetch<void>(`/admin/courses/${id}`, { method: "DELETE" });
