"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
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
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const res = await api.get<{ data?: Course[] } | Course[]>("/courses?limit=100")
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
  })

  const courses = data ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin — Courses</h1>

      {isLoading ? (
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
      ) : isError ? (
        <ErrorCard message="Failed to load courses. Please try again." onRetry={refetch} />
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
