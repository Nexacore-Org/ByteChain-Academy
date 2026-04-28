import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LessonResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'id field' })
  id: string;
  @ApiProperty({ example: 'Intro to Blockchain', description: 'title field' })
  title: string;
  @ApiProperty({ example: 'example', description: 'content field' })
  content: string;
  @ApiProperty({ example: true, description: 'published field' })
  published: boolean;
  @ApiProperty({ example: 'https://example.com/video.mp4', description: 'videoUrl field' })
  videoUrl: string | null;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'videoStartTimestamp field' })
  videoStartTimestamp: number | null;
  @ApiProperty({ example: 1, description: 'order field' })
  order: number;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'courseId field' })
  courseId: string;
  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'createdAt field' })
  createdAt: Date;
  @ApiProperty({ example: '2026-04-22T00:00:00.000Z', description: 'updatedAt field' })
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

