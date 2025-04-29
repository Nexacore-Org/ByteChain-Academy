import { PartialType } from '@nestjs/swagger';
import { CreateCourseEnrollmentDto } from './create-course-enrollment.dto';

export class UpdateCourseEnrollmentDto extends PartialType(
  CreateCourseEnrollmentDto,
) {}
