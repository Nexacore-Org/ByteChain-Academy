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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { QuizzesService } from './quizzes.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import {
  AdminQuizResponseDto,
  QuizResponseDto,
  QuizSubmissionResponseDto,
} from './dto/quiz-response.dto';
import { SubmitQuizBodyDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@ApiTags('Quizzes')
@ApiBearerAuth('access-token')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new quiz (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Quiz created successfully',
    type: AdminQuizResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async create(
    @Body() createQuizDto: CreateQuizDto,
  ): Promise<AdminQuizResponseDto> {
    const quiz = await this.quizzesService.create(createQuizDto);
    return new AdminQuizResponseDto(quiz);
  }

  @Get('lesson/:lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get quiz for a specific lesson' })
  @ApiResponse({
    status: 200,
    description: 'Quiz retrieved successfully',
    type: QuizResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findByLesson(
    @Param('lessonId') lessonId: string,
  ): Promise<QuizResponseDto> {
    const quiz = await this.quizzesService.findByLessonId(lessonId);
    return new QuizResponseDto(quiz);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update quiz details (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Quiz updated successfully',
    type: AdminQuizResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<AdminQuizResponseDto> {
    const quiz = await this.quizzesService.update(id, updateQuizDto);
    return new AdminQuizResponseDto(quiz);
  }

  @Get('submissions/my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user quiz submissions' })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully',
    type: [QuizSubmissionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMySubmissions(@Req() req): Promise<QuizSubmissionResponseDto[]> {
    const submissions = await this.quizzesService.getUserSubmissions(
      req.user.id,
    );
    return submissions.map((sub) => new QuizSubmissionResponseDto(sub));
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit answers for a quiz' })
  @ApiResponse({
    status: 201,
    description: 'Quiz submitted successfully',
    type: QuizSubmissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid answers' })
  @ApiResponse({ status: 409, description: 'Attempt limit reached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
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

  @Get(':id/attempts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user attempt history for a quiz' })
  @ApiResponse({
    status: 200,
    description: 'Attempt history retrieved successfully',
    type: [QuizSubmissionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserQuizAttempts(
    @Param('id') quizId: string,
    @Req() req,
  ): Promise<QuizSubmissionResponseDto[]> {
    const submissions = await this.quizzesService.getUserQuizAttempts(
      req.user.id,
      quizId,
    );
    return submissions.map((sub) => new QuizSubmissionResponseDto(sub));
  }

  @Get(':id/submission')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user submission for a specific quiz' })
  @ApiResponse({
    status: 200,
    description: 'Submission retrieved successfully',
    type: QuizSubmissionResponseDto,
  })
  @ApiResponse({ status: 204, description: 'No submission found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get quiz details by ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Quiz details retrieved successfully',
    type: AdminQuizResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findOne(@Param('id') id: string): Promise<AdminQuizResponseDto> {
    const quiz = await this.quizzesService.findOne(id);
    return new AdminQuizResponseDto(quiz);
  }
}
