import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { Lesson } from '../entities/lesson.entity';
import { QuizzesService } from '../services/quizzes.service';
import { QuizzesController } from '../controllers/quizzes.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Quiz, Question, Lesson])],
    controllers: [QuizzesController],
    providers: [QuizzesService],
    exports: [QuizzesService],
})
export class QuizzesModule { }
