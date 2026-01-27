import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '../entities/lesson.entity';
import { Course } from '../entities/course.entity';
import { LessonsService } from '../services/lessons.service';
import { LessonsController } from '../controllers/lessons.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Lesson, Course])],
    controllers: [LessonsController],
    providers: [LessonsService],
    exports: [LessonsService],
})
export class LessonsModule { }
