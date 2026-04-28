import { ApiProperty } from '@nestjs/swagger';
export class AnalyticsOverviewDto {
  @ApiProperty({ example: 1, description: 'totalUsers field' })
  totalUsers: number;
  @ApiProperty({ example: 1, description: 'totalCourses field' })
  totalCourses: number;
  @ApiProperty({ example: 1, description: 'totalLessons field' })
  totalLessons: number;
  @ApiProperty({ example: 1, description: 'totalEnrollments field' })
  totalEnrollments: number;
  @ApiProperty({ example: 1, description: 'totalCertificatesIssued field' })
  totalCertificatesIssued: number;
  @ApiProperty({ example: 1, description: 'totalQuizSubmissions field' })
  totalQuizSubmissions: number;
}

export class CoursePerformanceDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'courseId field' })
  courseId: string;
  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  title: string;
  @ApiProperty({ example: 1, description: 'enrollmentCount field' })
  enrollmentCount: number;
  @ApiProperty({ example: 1, description: 'completionCount field' })
  completionCount: number;
  @ApiProperty({ example: 1, description: 'completionRate field' })
  completionRate: number;
  @ApiProperty({ example: 1, description: 'averageQuizScore field' })
  averageQuizScore: number;
}

export class LearnerActivityPointDto {
  @ApiProperty({ example: 'example', description: 'date field' })
  date: string;
  @ApiProperty({ example: 1, description: 'activeUsers field' })
  activeUsers: number;
}

export class TopLearnerDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'userId field' })
  userId: string;
  @ApiProperty({ example: 'Jane Doe', description: 'username field' })
  username: string | null;
  @ApiProperty({ example: 1, description: 'xp field' })
  xp: number;
  @ApiProperty({ example: 1, description: 'coursesCompleted field' })
  coursesCompleted: number;
  @ApiProperty({ example: 1, description: 'certificatesEarned field' })
  certificatesEarned: number;
}

