import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { PaginationService } from '../common/services/pagination.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { PaginatedResult } from '../common/services/pagination.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseRegistration)
    private courseRegistrationRepository: Repository<CourseRegistration>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);
    return new CourseResponseDto(savedCourse);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<CourseResponseDto>> {
    const result = await this.paginationService.paginate<Course>(
      this.courseRepository,
      { page, limit },
      { where: { published: true }, order: { createdAt: 'DESC' } },
    );
    return {
      ...result,
      data: result.data.map((course) => new CourseResponseDto(course)),
    };
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CourseResponseDto>> {
    const result = await this.paginationService.paginate(
      this.courseRepository,
      { page, limit },
      {
        where: { published: true },
        order: { createdAt: 'DESC' },
      },
    );
    return {
      ...result,
      data: result.data.map((course) => new CourseResponseDto(course)),
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

  async findUserCourses(userId: string): Promise<CourseResponseDto[]> {
    const registrations = await this.courseRegistrationRepository.find({
      where: { userId },
      relations: ['course'],
    });

    return registrations.map(
      (registration) => new CourseResponseDto(registration.course),
    );
  }

  async findAllAdmin(
    page: number,
    limit: number,
    search?: string,
    status?: 'published' | 'draft' | '',
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
        where: where.length ? where : Object.keys(statusFilter).length ? statusFilter : undefined,
        order: { createdAt: 'DESC' },
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
    await this.courseRepository.remove(course);
  }

  async enrollUser(userId: string, courseId: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const existingRegistration =
      await this.courseRegistrationRepository.findOne({
        where: { userId, courseId },
      });

    if (!existingRegistration) {
      const registration = this.courseRegistrationRepository.create({
        userId,
        courseId,
      });
      await this.courseRegistrationRepository.save(registration);
    }
  }

  async remove(id: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    await this.courseRepository.remove(course);
  }
}
