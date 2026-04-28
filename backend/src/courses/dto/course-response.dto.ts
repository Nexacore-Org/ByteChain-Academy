import { ApiProperty } from '@nestjs/swagger';

export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  published: boolean;

  @ApiProperty({ nullable: true })
  difficulty: string | null;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ nullable: true })
  thumbnailUrl: string | null;

  @ApiProperty()
  enrollmentCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  isEnrolled?: boolean;

  constructor(
    course: {
      id: string;
      title: string;
      description: string;
      published: boolean;
      difficulty?: string | null;
      tags?: string[];
      thumbnailUrl?: string | null;
      registrations?: { id: string }[];
      createdAt: Date;
      updatedAt: Date;
    },
    options?: { isEnrolled?: boolean; enrollmentCount?: number },
  ) {
    this.id = course.id;
    this.title = course.title;
    this.description = course.description;
    this.published = course.published;
    this.difficulty = course.difficulty ?? null;
    this.tags = course.tags ?? [];
    this.thumbnailUrl = course.thumbnailUrl ?? null;
    this.enrollmentCount = options?.enrollmentCount ?? course.registrations?.length ?? 0;
    this.createdAt = course.createdAt;
    this.updatedAt = course.updatedAt;
    if (options?.isEnrolled !== undefined) {
      this.isEnrolled = options.isEnrolled;
    }
  }
}
