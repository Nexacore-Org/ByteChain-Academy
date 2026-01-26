import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, Min, IsUrl } from 'class-validator';

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUrl({}, { message: 'videoUrl must be a valid URL' })
    @IsOptional()
    videoUrl?: string;

    @IsNumber()
    @Min(0, { message: 'videoStartTimestamp must be a non-negative number' })
    @IsOptional()
    videoStartTimestamp?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    order?: number;

    @IsUUID()
    @IsNotEmpty()
    courseId: string;
}

export class UpdateLessonDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsUrl({}, { message: 'videoUrl must be a valid URL' })
    @IsOptional()
    videoUrl?: string;

    @IsNumber()
    @Min(0, { message: 'videoStartTimestamp must be a non-negative number' })
    @IsOptional()
    videoStartTimestamp?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    order?: number;
}

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
