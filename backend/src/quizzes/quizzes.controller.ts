import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { QuizzesService } from './quizzes.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import {
  AdminQuizResponseDto,
  QuizResponseDto,
  QuizSubmissionResponseDto,
} from './dto/quiz-response.dto';
import { SubmitQuizBodyDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<AdminQuizResponseDto> {
    const quiz = await this.quizzesService.create(createQuizDto);
    return new AdminQuizResponseDto(quiz);
  }

  @Get('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  async findByLesson(
    @Param('lessonId') lessonId: string,
  ): Promise<QuizResponseDto> {
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

  @Get('submissions/my')
  @UseGuards(JwtAuthGuard)
  async getMySubmissions(@Req() req): Promise<QuizSubmissionResponseDto[]> {
    const submissions = await this.quizzesService.getUserSubmissions(
      req.user.id,
    );
    return submissions.map((sub) => new QuizSubmissionResponseDto(sub));
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submitQuiz(
    @Param('id') quizId: string,
    @Body() submitQuizBodyDto: SubmitQuizBodyDto,
    @Req() req,
  ): Promise<QuizSubmissionResponseDto> {
    const submission = await this.quizzesService.submitQuiz(req.user.id, {
      quizId,
      answers: submitQuizBodyDto.answers,
    });
    return new QuizSubmissionResponseDto(submission);
  }

  @Get(':id/submission')
  @UseGuards(JwtAuthGuard)
  async getUserSubmission(
    @Param('id') quizId: string,
    @Req() req,
  ): Promise<QuizSubmissionResponseDto | null> {
    const submission = await this.quizzesService.getUserSubmission(
      req.user.id,
      quizId,
    );
    return submission ? new QuizSubmissionResponseDto(submission) : null;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string): Promise<AdminQuizResponseDto> {
    const quiz = await this.quizzesService.findOne(id);
    return new AdminQuizResponseDto(quiz);
  }
}
