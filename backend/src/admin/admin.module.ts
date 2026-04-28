import { Module } from '@nestjs/common';
import { AdminCoursesController } from './admin-courses.controller';
import { AdminDAOController } from './admin-dao.controller';
import { CoursesModule } from '../courses/courses.module';
import { LessonsModule } from '../lessons/lessons.module';
import { DAOModule } from '../dao/dao.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [CoursesModule, LessonsModule, DAOModule, TypeOrmModule.forFeature([User])],
  controllers: [AdminCoursesController, AdminDAOController],
})
export class AdminModule {}
