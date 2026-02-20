import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseRegistration } from '../courses/entities/course-registration.entity';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseRegistration)
    private courseRegistrationRepository: Repository<CourseRegistration>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = this.courseRepository.create(createCourseDto);
    const savedCourse = await this.courseRepository.save(course);
    return new CourseResponseDto(savedCourse);
  }

  async findAll(): Promise<CourseResponseDto[]> {
    const courses = await this.courseRepository.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
    });
    return courses.map((course) => new CourseResponseDto(course));
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
}
