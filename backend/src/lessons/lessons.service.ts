import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/entities/course.entity';
import { Lesson } from 'src/entities/lesson.entity';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: createLessonDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createLessonDto.courseId} not found`,
      );
    }

    // Create lesson
    const lesson = this.lessonRepository.create({
      title: createLessonDto.title,
      content: createLessonDto.content,
      videoUrl: createLessonDto.videoUrl,
      videoStartTimestamp: createLessonDto.videoStartTimestamp,
      order: createLessonDto.order ?? 0,
      courseId: createLessonDto.courseId,
    });

    return this.lessonRepository.save(lesson);
  }

  async findAllByCourse(courseId: string): Promise<Lesson[]> {
    // Verify course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    return this.lessonRepository.find({
      where: { courseId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Update fields if provided
    if (updateLessonDto.title !== undefined) {
      lesson.title = updateLessonDto.title;
    }
    if (updateLessonDto.content !== undefined) {
      lesson.content = updateLessonDto.content;
    }
    if (updateLessonDto.videoUrl !== undefined) {
      lesson.videoUrl = updateLessonDto.videoUrl;
    }
    if (updateLessonDto.videoStartTimestamp !== undefined) {
      lesson.videoStartTimestamp = updateLessonDto.videoStartTimestamp;
    }
    if (updateLessonDto.order !== undefined) {
      lesson.order = updateLessonDto.order;
    }

    return this.lessonRepository.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    await this.lessonRepository.remove(lesson);
  }
}
