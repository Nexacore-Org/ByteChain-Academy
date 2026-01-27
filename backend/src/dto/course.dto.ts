import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsBoolean()
    @IsOptional()
    published?: boolean;
}

export class UpdateCourseDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    @IsOptional()
    published?: boolean;
}

export class CourseResponseDto {
    id: string;
    title: string;
    description: string;
    published: boolean;
    createdAt: Date;
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
