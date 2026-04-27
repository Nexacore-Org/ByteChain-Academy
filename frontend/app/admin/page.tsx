"use client";

import { Users, BookOpen, GraduationCap, Award } from "lucide-react";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ActivityChart } from "@/components/admin/activity-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAnalyticsOverview,
  useCoursePerformance,
  useLearnerActivity,
} from "@/hooks/use-admin-analytics";

function StatCardSkeleton() {
  return (
    <div className="h-32 animate-pulse rounded-xl border bg-gray-100" />
  );
}

function ChartSkeleton() {
  return (
    <div className="h-72 animate-pulse rounded-xl border bg-gray-100" />
  );
}

export default function AdminDashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: coursePerf, isLoading: perfLoading } = useCoursePerformance();
  const { data: activity, isLoading: activityLoading } = useLearnerActivity();

  const statCards = [
    {
      label: "Total Users",
      value: overview?.totalUsers ?? 0,
      icon: Users,
    },
    {
      label: "Total Courses",
      value: overview?.totalCourses ?? 0,
      icon: BookOpen,
    },
    {
      label: "Total Enrollments",
      value: overview?.totalEnrollments ?? 0,
      icon: GraduationCap,
    },
    {
      label: "Certificates Issued",
      value: overview?.certificatesIssued ?? 0,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform overview and analytics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <AdminStatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
              />
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity Chart — 2/3 width */}
        <div className="lg:col-span-2">
          {activityLoading ? (
            <ChartSkeleton />
          ) : (
            <ActivityChart data={activity ?? []} />
          )}
        </div>

        {/* Top 5 Courses — 1/3 width */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Top Courses by Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {perfLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <ol className="space-y-3">
                {(coursePerf ?? []).slice(0, 5).map((course, idx) => (
                  <li key={course.courseId} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollments.toLocaleString()} enrollments
                      </p>
                    </div>
                  </li>
                ))}
                {(coursePerf ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No data available.</p>
                )}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
