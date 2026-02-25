"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"

interface Course {
  id: string
  title: string
  description: string
  published: boolean
}

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ data: Course[] } | Course[]>("/courses?limit=100")
      .then((res: unknown) => {
        const r = res as { data?: Course[] } | Course[]
        const list = Array.isArray(r) ? r : r?.data ?? []
        setCourses(list)
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin — Courses</h1>
      {loading ? (
        <p className="text-gray-400">Loading courses…</p>
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
