import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { Controller, Get, Post, Body, Patch, Param, Put, ValidationPipe, Request, ForbiddenException, Delete, UseGuards, Query } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizAttemptsService } from './quiz-attempt.services';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService, private readonly quizAttemptsService: QuizAttemptsService,) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
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

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get quizzes by lesson ID' })
  @ApiResponse({ status: 200, description: 'Return quizzes for a specific lesson' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByLessonId(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLessonId(+lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiResponse({ status: 200, description: 'Return a quiz by ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
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
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
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

  }
}

