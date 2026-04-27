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
  published: boolean;
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
    this.published = lesson.published !== undefined ? lesson.published : true;
    this.videoUrl = lesson.videoUrl || null;
    this.videoStartTimestamp = lesson.videoStartTimestamp || null;
    this.order = lesson.order;
    this.courseId = lesson.courseId;
    this.createdAt = lesson.createdAt;
    this.updatedAt = lesson.updatedAt;
  }
}
