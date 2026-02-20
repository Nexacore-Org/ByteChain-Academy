import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsUrl,
} from 'class-validator';

export class LessonResponseDto {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  videoStartTimestamp: number | null;
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(lesson: any) {
    this.id = lesson.id;
    this.title = lesson.title;
    this.content = lesson.content;
    this.videoUrl = lesson.videoUrl || null;
    this.videoStartTimestamp = lesson.videoStartTimestamp || null;
    this.order = lesson.order;
    this.courseId = lesson.courseId;
    this.createdAt = lesson.createdAt;
    this.updatedAt = lesson.updatedAt;
  }
}
