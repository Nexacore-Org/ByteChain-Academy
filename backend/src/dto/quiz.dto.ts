import { IsString, IsNotEmpty, IsArray, ValidateNested, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../entities/question.entity';

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsEnum(QuestionType)
    @IsOptional()
    type?: QuestionType;

    @IsArray()
    @IsString({ each: true })
    options: string[];

    @IsString()
    @IsNotEmpty()
    correctAnswer: string;
}

export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    @IsNotEmpty()
    lessonId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[];
}

export class UpdateQuizDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions?: CreateQuestionDto[];
}

export class QuestionResponseDto {
    id: string;
    text: string;
    type: QuestionType;
    options: string[];
}

export class QuizResponseDto {
    id: string;
    title: string;
    description: string;
    lessonId: string;
    questions: QuestionResponseDto[];

    constructor(quiz: any) {
        this.id = quiz.id;
        this.title = quiz.title;
        this.description = quiz.description;
        this.lessonId = quiz.lessonId;
        this.questions = quiz.questions?.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options
        })) || [];
    }
}

export class AdminQuizResponseDto extends QuizResponseDto {
    questions: (QuestionResponseDto & { correctAnswer: string })[];

    constructor(quiz: any) {
        super(quiz);
        this.questions = quiz.questions?.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer
        })) || [];
    }
}
