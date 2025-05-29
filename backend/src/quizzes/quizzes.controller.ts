import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  ValidationPipe,
  Request,
  ForbiddenException,
  Delete,
  UseGuards,
  Query,
  UsePipes,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizAttemptsService } from './quiz-attempt.services';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { RolesGuard } from 'src/roles/roles.guard';
import { UserRole } from 'src/roles/roles.enum';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly quizAttemptsService: QuizAttemptsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TUTOR)
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quizzes' })
  @ApiResponse({ status: 200, description: 'Return all quizzes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.quizzesService.findAll();
  }

  // @Get('lesson/:lessonId')
  // @ApiOperation({ summary: 'Get quizzes by lesson ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return quizzes for a specific lesson',
  // })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // findByLessonId(@Param('lessonId') lessonId: string) {
  //   return this.quizzesService.findByLessonId(+lessonId);
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiResponse({ status: 200, description: 'Return a quiz by ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TUTOR)
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.update(+id, updateQuizDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TUTOR)
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(+id);
  }

  @Post('attempts/start')
  @UsePipes(new ValidationPipe())
  async startQuizAttempt(
    @Body() createQuizAttemptDto: CreateQuizAttemptDto,
    @Request() req,
  ): Promise<QuizAttempt> {
    // Ensure the user is starting an attempt for themselves
    if (req.user.id !== createQuizAttemptDto.userId) {
      throw new ForbiddenException(
        'You can only start quiz attempts for yourself',
      );
    }

    return this.quizAttemptsService.startQuizAttempt(createQuizAttemptDto);
  }

  @Get('attempts/:id')
  async getQuizAttempt(
    @Param('id') id: string,
    @Request() req,
  ): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptsService.getQuizAttempt(id);

    // Ensure users can only access their own attempts
    if (req.user.id !== attempt.userId) {
      throw new ForbiddenException(
        'You can only access your own quiz attempts',
      );
    }

    return attempt;
  }

  @Put('attempts/:id/submit')
  async submitQuizAttempt(
    @Param('id') id: string,
    @Body() submitDto: SubmitQuizAttemptDto,
    @Request() req,
  ): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptsService.getQuizAttempt(id);

    // Ensure users can only submit their own attempts
    if (req.user.id !== attempt.userId) {
      throw new ForbiddenException(
        'You can only submit your own quiz attempts',
      );
    }

    return this.quizAttemptsService.submitQuizAttempt(id, submitDto);
  }

  @Get('user/attempts')
  async getUserQuizAttempts(
    @Query('quizId') quizId: string,
    @Request() req,
  ): Promise<QuizAttempt[]> {
    return this.quizAttemptsService.getUserQuizAttempts(req.user.id, quizId);
  }
}
