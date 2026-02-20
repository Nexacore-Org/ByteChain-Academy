/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IsString, IsNotEmpty, IsBoolean, IsDate } from 'class-validator';

export class CourseResponseDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  published: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  constructor(course: any) {
    this.id = course.id;
    this.title = course.title;
    this.description = course.description;
    this.published = course.published;
    this.createdAt = course.createdAt;
    this.updatedAt = course.updatedAt;
  }
}
