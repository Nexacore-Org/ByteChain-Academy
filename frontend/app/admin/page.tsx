"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorCard } from "@/components/ui/error-card"

interface Course {
  id: string
  title: string
  description: string
  published: boolean
}

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get<{ data: Course[] } | Course[]>("/courses?limit=100")
      .then((res: unknown) => {
        const r = res as { data?: Course[] } | Course[]
        const list = Array.isArray(r) ? r : (r?.data ?? [])
        setCourses(list)
      })
      .catch(() => {
        setError("Failed to load courses. Please try again.")
        setCourses([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin — Courses</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-white/10">
              <CardContent className="p-4 flex justify-between items-center">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorCard message={error} onRetry={load} />
      ) : courses.length === 0 ? (
        <p className="text-gray-400">No courses found.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/admin/courses/${c.id}/lessons`}>
              <Card className="border-white/10 hover:border-[#00ff88]/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex justify-between items-center">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-sm text-gray-400">Manage lessons →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
