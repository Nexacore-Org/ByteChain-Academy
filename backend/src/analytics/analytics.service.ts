import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Certificate } from 'src/certificates/entities/certificate.entity';
import { CourseRegistration } from 'src/courses/entities/course-registration.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Progress } from 'src/progress/entities/progress.entity';
import { QuizSubmission } from 'src/quizzes/entities/quiz-submission.entity';
import { User } from 'src/users/entities/user.entity';
import {
  AnalyticsOverviewDto,
  CoursePerformanceDto,
  LearnerActivityPointDto,
  TopLearnerDto,
} from './dto/analytics-response.dto';

const CACHE_TTL_SECONDS = 300;

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(QuizSubmission)
    private readonly quizSubmissionRepository: Repository<QuizSubmission>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(CourseRegistration)
    private readonly courseRegistrationRepository: Repository<CourseRegistration>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getOverview(): Promise<AnalyticsOverviewDto> {
    const cacheKey = 'analytics:overview';
    const cached = await this.cacheManager.get<AnalyticsOverviewDto>(cacheKey);
    if (cached) return cached;

    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalEnrollments,
      totalCertificatesIssued,
      totalQuizSubmissions,
    ] = await Promise.all([
      this.userRepository.count(),
      this.courseRepository.count(),
      this.lessonRepository.count(),
      this.courseRegistrationRepository.count(),
      this.certificateRepository.count(),
      this.quizSubmissionRepository.count(),
    ]);

    const payload: AnalyticsOverviewDto = {
      totalUsers,
      totalCourses,
      totalLessons,
      totalEnrollments,
      totalCertificatesIssued,
      totalQuizSubmissions,
    };
    await this.cacheManager.set(cacheKey, payload, CACHE_TTL_SECONDS);
    return payload;
  }

  async getCoursePerformance(): Promise<CoursePerformanceDto[]> {
    const cacheKey = 'analytics:course-performance';
    const cached =
      await this.cacheManager.get<CoursePerformanceDto[]>(cacheKey);
    if (cached) return cached;

    const rows = await this.courseRepository
      .createQueryBuilder('c')
      .leftJoin(CourseRegistration, 'cr', 'cr.courseId = c.id')
      .leftJoin(Certificate, 'cert', 'cert.courseId = c.id')
      .leftJoin(Lesson, 'l', 'l.courseId = c.id')
      .leftJoin('quizzes', 'q', 'q.lessonId = l.id')
      .leftJoin(QuizSubmission, 'qs', 'qs.quizId = q.id')
      .select('c.id', 'courseId')
      .addSelect('c.title', 'title')
      .addSelect('COUNT(DISTINCT cr.id)', 'enrollmentCount')
      .addSelect('COUNT(DISTINCT cert.id)', 'completionCount')
      .addSelect('COALESCE(AVG(qs.score), 0)', 'averageQuizScore')
      .groupBy('c.id')
      .addGroupBy('c.title')
      .orderBy('c.title', 'ASC')
      .getRawMany<{
        courseId: string;
        title: string;
        enrollmentCount: string;
        completionCount: string;
        averageQuizScore: string;
      }>();

    const payload = rows.map((row) => {
      const enrollmentCount = Number(row.enrollmentCount ?? 0);
      const completionCount = Number(row.completionCount ?? 0);
      const completionRate =
        enrollmentCount > 0
          ? Number(((completionCount / enrollmentCount) * 100).toFixed(2))
          : 0;
      return {
        courseId: row.courseId,
        title: row.title,
        enrollmentCount,
        completionCount,
        completionRate,
        averageQuizScore: Number(Number(row.averageQuizScore ?? 0).toFixed(2)),
      };
    });

    await this.cacheManager.set(cacheKey, payload, CACHE_TTL_SECONDS);
    return payload;
  }

  async getLearnerActivity(): Promise<LearnerActivityPointDto[]> {
    const cacheKey = 'analytics:learner-activity';
    const cached =
      await this.cacheManager.get<LearnerActivityPointDto[]>(cacheKey);
    if (cached) return cached;

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const rows = await this.progressRepository
      .createQueryBuilder('p')
      .select('DATE(p.completedAt)', 'activityDate')
      .addSelect('COUNT(DISTINCT p.userId)', 'activeUsers')
      .where('p.completed = :completed', { completed: true })
      .andWhere('p.completedAt BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(p.completedAt)')
      .orderBy('activityDate', 'ASC')
      .getRawMany<{ activityDate: string; activeUsers: string }>();

    const rowMap = new Map(
      rows.map((row) => [row.activityDate, Number(row.activeUsers)]),
    );
    const payload: LearnerActivityPointDto[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateKey = date.toISOString().slice(0, 10);
      payload.push({
        date: dateKey,
        activeUsers: rowMap.get(dateKey) ?? 0,
      });
    }

    await this.cacheManager.set(cacheKey, payload, CACHE_TTL_SECONDS);
    return payload;
  }

  async getTopLearners(): Promise<TopLearnerDto[]> {
    const cacheKey = 'analytics:top-learners';
    const cached = await this.cacheManager.get<TopLearnerDto[]>(cacheKey);
    if (cached) return cached;

    const rows = await this.userRepository
      .createQueryBuilder('u')
      .leftJoin(Certificate, 'cert', 'cert.userId = u.id')
      .select('u.id', 'userId')
      .addSelect('u.username', 'username')
      .addSelect('u.name', 'name')
      .addSelect('u.xp', 'xp')
      .addSelect('u.points', 'points')
      .addSelect('u.coursesCompleted', 'coursesCompleted')
      .addSelect('COUNT(cert.id)', 'certificatesEarned')
      .groupBy('u.id')
      .addGroupBy('u.username')
      .addGroupBy('u.name')
      .addGroupBy('u.xp')
      .addGroupBy('u.points')
      .addGroupBy('u.coursesCompleted')
      .orderBy('u.xp', 'DESC')
      .addOrderBy('u.points', 'DESC')
      .limit(10)
      .getRawMany<{
        userId: string;
        username: string | null;
        name: string | null;
        xp: string;
        points: string;
        coursesCompleted: string;
        certificatesEarned: string;
      }>();

    const payload = rows.map((row) => {
      const resolvedXp =
        Number(row.xp ?? 0) > 0 ? Number(row.xp) : Number(row.points ?? 0);
      return {
        userId: row.userId,
        username: row.username ?? row.name ?? null,
        xp: resolvedXp,
        coursesCompleted: Number(row.coursesCompleted ?? 0),
        certificatesEarned: Number(row.certificatesEarned ?? 0),
      };
    });

    await this.cacheManager.set(cacheKey, payload, CACHE_TTL_SECONDS);
    return payload;
  }
}
