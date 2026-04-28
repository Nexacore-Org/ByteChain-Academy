"use client"

import { Header } from "@/components/header"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { CourseCardSkeleton } from "@/components/courses/course-card-skeleton"
import { ErrorCard } from "@/components/ui/error-card"

interface Course {
  id: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  rating?: number
  duration?: number
  lessons?: number
  students?: number
  enrollmentCount?: number
  isEnrolled?: boolean
  instructor?: string
}

export default function CoursesPage() {
  const { data, isLoading, isError, refetch } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await api.get<{ data?: Course[] } | Course[]>("/courses")
      const r = res as { data?: Course[] } | Course[]
      return Array.isArray(r) ? r : (r?.data ?? [])
    },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse All Courses</h1>
          <p className="text-gray-400 text-lg">
            Explore our comprehensive Web3 curriculum. Sign in to enroll and track your progress.
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <ErrorCard
            message="Failed to load courses. Please try again."
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.length === 0 ? (
              <p className="text-gray-400 col-span-3 text-center py-12">
                No courses available yet.
              </p>
            ) : (
              data.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  difficulty={course.difficulty ?? "Beginner"}
                  rating={course.rating ?? 0}
                  duration={course.duration ?? 0}
                  lessons={course.lessons ?? 0}
                  students={course.enrollmentCount ?? course.students ?? 0}
                  instructor={course.instructor ?? ""}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
