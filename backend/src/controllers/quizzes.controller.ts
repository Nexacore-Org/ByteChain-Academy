import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { QuizzesService } from '../services/quizzes.service';
import { CreateQuizDto, UpdateQuizDto, QuizResponseDto, AdminQuizResponseDto } from '../dto/quiz.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async create(@Body() createQuizDto: CreateQuizDto): Promise<AdminQuizResponseDto> {
        const quiz = await this.quizzesService.create(createQuizDto);
        return new AdminQuizResponseDto(quiz);
    }

    @Get('lesson/:lessonId')
    @UseGuards(JwtAuthGuard)
    async findByLesson(@Param('lessonId') lessonId: string): Promise<QuizResponseDto> {
        const quiz = await this.quizzesService.findByLessonId(lessonId);
        return new QuizResponseDto(quiz);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async update(
        @Param('id') id: string,
        @Body() updateQuizDto: UpdateQuizDto,
    ): Promise<AdminQuizResponseDto> {
        const quiz = await this.quizzesService.update(id, updateQuizDto);
        return new AdminQuizResponseDto(quiz);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    async findOne(@Param('id') id: string): Promise<AdminQuizResponseDto> {
        const quiz = await this.quizzesService.findOne(id);
        return new AdminQuizResponseDto(quiz);
    }
}
