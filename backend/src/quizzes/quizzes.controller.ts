import { Controller, Get, Post, Body, Patch, Param, Put, ValidationPipe, Request, ForbiddenException, Query } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';

import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizAttemptsService } from './quiz-attempt.services';
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService, private readonly quizAttemptsService: QuizAttemptsService,) {}

  @Post()
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }

  @Get()
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.update(+id, updateQuizDto);
  }
  

  @Delete(':id')
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
      throw new ForbiddenException('You can only start quiz attempts for yourself');
    }
    
    return this.quizAttemptsService.startQuizAttempt(createQuizAttemptDto);
  }

  @Get('attempts/:id')
  async getQuizAttempt(@Param('id') id: string, @Request() req): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptsService.getQuizAttempt(id);
    
    // Ensure users can only access their own attempts
    if (req.user.id !== attempt.userId) {
      throw new ForbiddenException('You can only access your own quiz attempts');
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
      throw new ForbiddenException('You can only submit your own quiz attempts');
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
function UsePipes(arg0: any): MethodDecorator {
  throw new Error('Function not implemented.');
}

function Delete(arg0: string): MethodDecorator {
  throw new Error('Function not implemented.');
}

