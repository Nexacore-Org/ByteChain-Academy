/**
 * API client for ByteChain backend.
 * Uses NEXT_PUBLIC_API_URL or falls back to http://localhost:3001/api/v1.
 */

const API_BASE =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3001/api/v1";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCourses {
  data: AdminCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminLesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  videoStartTimestamp?: number;
  order: number;
  courseId: string;
}

export async function fetchAdminCourses(params: {
  search?: string;
  status?: "published" | "draft" | "";
  page?: number;
  limit?: number;
}): Promise<PaginatedCourses> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit ?? 10));
  const qs = searchParams.toString();
  const url = `${API_BASE}/admin/courses${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: getAuthHeaders() });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to fetch courses (${res.status})`);
  }
  return res.json() as Promise<PaginatedCourses>;
}

export async function deleteAdminCourse(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to delete course (${res.status})`);
  }
}

export async function reorderLessons(
  courseId: string,
  orderedIds: string[]
): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/courses/${courseId}/lessons/reorder`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderedIds }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to reorder lessons (${res.status})`);
  }
}

export async function fetchLessonsByCourse(
  courseId: string
): Promise<AdminLesson[]> {
  const res = await fetch(`${API_BASE}/lessons/course/${courseId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Failed to fetch lessons (${res.status})`);
  }
  return res.json();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
    credentials: "include",
  });
  if (!res.ok) {
    const err = new Error(res.statusText || `HTTP ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
