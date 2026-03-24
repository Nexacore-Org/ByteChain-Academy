export class AnalyticsOverviewDto {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalEnrollments: number;
  totalCertificatesIssued: number;
  totalQuizSubmissions: number;
}

export class CoursePerformanceDto {
  courseId: string;
  title: string;
  enrollmentCount: number;
  completionCount: number;
  completionRate: number;
  averageQuizScore: number;
}

export class LearnerActivityPointDto {
  date: string;
  activeUsers: number;
}

export class TopLearnerDto {
  userId: string;
  username: string | null;
  xp: number;
  coursesCompleted: number;
  certificatesEarned: number;
}
