import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { PaginationService } from '../common/services/pagination.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { PaginatedResult } from '../common/services/pagination.service';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../progress/entities/progress.entity';
import {
  CourseRegistrationResponseDto,
  EnrollmentStatusResponseDto,
  EnrolledCourseResponseDto,
} from './dto/enrollment-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseRegistration)
    private courseRegistrationRepository: Repository<CourseRegistration>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    private readonly paginationService: PaginationService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);
    return new CourseResponseDto(savedCourse);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: string,
  ): Promise<PaginatedResult<CourseResponseDto>> {
    return this.findAllPaginated(page, limit, userId);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    userId?: string,
  ): Promise<PaginatedResult<CourseResponseDto>> {
    const result = await this.paginationService.paginate<Course>(
      this.courseRepository,
      { page, limit },
      { where: { published: true }, order: { createdAt: 'DESC' } },
    );

    let enrolledIds = new Set<string>();
    if (userId && result.data.length > 0) {
      const courseIds = result.data.map((c) => c.id);
      const regs = await this.courseRegistrationRepository.find({
        where: { userId, courseId: In(courseIds) },
        select: ['courseId'],
      });
      enrolledIds = new Set(regs.map((r) => r.courseId));
    }

    return {
      ...result,
      data: result.data.map(
        (course) =>
          new CourseResponseDto(course, {
            isEnrolled:
              userId !== undefined ? enrolledIds.has(course.id) : undefined,
          }),
      ),
    };
  }

  async findOne(id: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return new CourseResponseDto(course);
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    Object.assign(course, updateCourseDto);
    const updatedCourse = await this.courseRepository.save(course);
    return new CourseResponseDto(updatedCourse);
  }

  /**
   * Idempotent: returns existing registration if already enrolled.
   */
  async enroll(
    userId: string,
    courseId: string,
  ): Promise<CourseRegistrationResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, published: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const existing = await this.courseRegistrationRepository.findOne({
      where: { userId, courseId },
    });
    if (existing) {
      return this.toRegistrationDto(existing);
    }

    const registration = this.courseRegistrationRepository.create({
      userId,
      courseId,
    });
    try {
      const saved = await this.courseRegistrationRepository.save(registration);
      return this.toRegistrationDto(saved);
    } catch (err) {
      const again = await this.courseRegistrationRepository.findOne({
        where: { userId, courseId },
      });
      if (again) {
        return this.toRegistrationDto(again);
      }
      throw err;
    }
  }

  async unenroll(userId: string, courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const result = await this.courseRegistrationRepository.delete({
      userId,
      courseId,
    });
    if (!result.affected) {
      throw new NotFoundException('Enrolment not found');
    }
  }

  async getEnrollmentStatus(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentStatusResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const reg = await this.courseRegistrationRepository.findOne({
      where: { userId, courseId },
    });
    if (!reg) {
      return { enrolled: false };
    }
    return { enrolled: true, enrolledAt: reg.enrolledAt };
  }

  async getEnrolledCourses(
    userId: string,
  ): Promise<EnrolledCourseResponseDto[]> {
    const registrations = await this.courseRegistrationRepository.find({
      where: { userId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });

    const out: EnrolledCourseResponseDto[] = [];

    for (const reg of registrations) {
      const course = reg.course;
      if (!course) continue;

      const totalLessons = await this.lessonRepository.count({
        where: { courseId: course.id },
      });
      const completedLessons = await this.progressRepository.count({
        where: { userId, courseId: course.id, completed: true },
      });
      const progressPercent =
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100);

      out.push({
        id: course.id,
        title: course.title,
        description: course.description,
        published: course.published,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        progressPercent,
        enrolledAt: reg.enrolledAt,
      });
    }

    return out;
  }

  private toRegistrationDto(
    r: CourseRegistration,
  ): CourseRegistrationResponseDto {
    return {
      id: r.id,
      userId: r.userId,
      courseId: r.courseId,
      enrolledAt: r.enrolledAt,
    };
  }

  async findAllAdmin(
    page: number,
    limit: number,
    search?: string,
    status?: 'published' | 'draft' | '',
    includeDeleted?: boolean,
  ): Promise<PaginatedResult<CourseResponseDto>> {
    const where: Record<string, unknown>[] = [];

    const statusFilter: Record<string, unknown> = {};
    if (status === 'published') statusFilter.published = true;
    if (status === 'draft') statusFilter.published = false;

    if (search) {
      where.push(
        { title: ILike(`%${search}%`), ...statusFilter },
        { description: ILike(`%${search}%`), ...statusFilter },
      );
    }

    const result = await this.paginationService.paginate<Course>(
      this.courseRepository,
      { page, limit },
      {
        where: where.length
          ? where
          : Object.keys(statusFilter).length
            ? statusFilter
            : undefined,
        order: { createdAt: 'DESC' },
        withDeleted: includeDeleted,
      },
    );

    return {
      ...result,
      data: result.data.map((course) => new CourseResponseDto(course)),
    };
  }

  async remove(id: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    await this.courseRepository.softRemove(course);
  }

  async restore(id: string): Promise<void> {
    const result = await this.courseRepository.restore(id);
    if (result === 0) {
      throw new NotFoundException(`Course with ID ${id} not found or not deleted`);
    }
  }

  async publishCourse(id: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.published) {
      return new CourseResponseDto(course);
    }

    const publishedLessonCount = await this.lessonRepository.count({
      where: { courseId: id },
    });

    if (publishedLessonCount === 0) {
      throw new BadRequestException(
        'Cannot publish a course with no lessons',
      );
    }

    course.published = true;
    const updatedCourse = await this.courseRepository.save(course);

    const enrolledUsers = await this.courseRegistrationRepository.find({
      where: { courseId: id },
      select: ['userId'],
    });

    for (const enrollment of enrolledUsers) {
      await this.notificationsService.createNotification(
        enrollment.userId,
        NotificationType.NEW_CONTENT,
        `New content available in course: ${course.title}`,
        `/courses/${id}`,
      );
    }

    return new CourseResponseDto(updatedCourse);
  }

  async unpublishCourse(id: string): Promise<CourseResponseDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (!course.published) {
      return new CourseResponseDto(course);
    }

    course.published = false;
    const updatedCourse = await this.courseRepository.save(course);

    return new CourseResponseDto(updatedCourse);
  }
}
