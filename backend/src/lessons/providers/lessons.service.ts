import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../entities/lessons.entity';
import { CreateLessonDto } from '../dtos/createLessonsDto';
import { UpdateLessonDto } from '../dtos/updateLessonsDto';
import { Course } from 'src/course/entities/course.entity';

@Injectable()
export class LessonsService {
  async getLessonProgress(userId: number) {
    const lessons = await this.lessonRepository.find({ where: { userId } });
    return lessons;
  }

  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const course = await this.courseRepository.findOne({
      where: { id: createLessonDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const lesson = this.lessonRepository.create(createLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonRepository.find({ relations: ['course'] });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['course'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonRepository.preload({
      id,
      ...updateLessonDto,
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return this.lessonRepository.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.lessonRepository.remove(lesson);
  }
}
