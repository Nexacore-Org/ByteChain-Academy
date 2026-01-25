import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Course } from '../entities/course.entity';
import { CourseRegistration } from '../entities/course-registration.entity';
import { CoursesService } from '../services/courses.service';
import { CoursesController } from '../controllers/courses.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Course, CourseRegistration]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'default-secret-key',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService],
})
export class CoursesModule { }
