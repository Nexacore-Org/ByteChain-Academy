import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseReviewDto } from './create-course-review.dto';

export class UpdateCourseReviewDto extends PartialType(CreateCourseReviewDto) {}
