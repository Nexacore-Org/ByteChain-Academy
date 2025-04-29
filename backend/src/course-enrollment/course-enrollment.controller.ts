import { Controller, Post, Delete, Param, HttpCode } from '@nestjs/common';
import { CourseEnrollmentService } from './course-enrollment.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Enrollments')
@Controller('enrollments')
export class CourseEnrollmentController {
  constructor(private readonly enrollmentService: CourseEnrollmentService) {}

  @Post(':studentId/courses/:courseId')
  @ApiOperation({ summary: 'Enroll a student into a course' })
  @ApiParam({ name: 'studentId', required: true })
  @ApiParam({ name: 'courseId', required: true })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
  async enrollInCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentService.enroll(studentId, courseId);
  }

  @Delete(':studentId/courses/:courseId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove student from a course' })
  @ApiParam({ name: 'studentId', required: true })
  @ApiParam({ name: 'courseId', required: true })
  @ApiResponse({ status: 204, description: 'Student unenrolled successfully' })
  async leaveCourse(
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    await this.enrollmentService.leaveCourse(studentId, courseId);
  }
}
