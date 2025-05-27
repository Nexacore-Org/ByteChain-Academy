import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CourseReviewService } from '../services/course-review.service';
import { Roles } from '../../roles/roles.decorator';
import { UserRole } from '../../roles/roles.enum';
import { RolesGuard } from '../../roles/roles.guard';
import { CreateCourseReviewDto } from '../dto/create-course-review.dto';
import { UpdateCourseReviewDto } from '../dto/update-course-review.dto';

@Controller('course-reviews')
@UseGuards(RolesGuard)
export class CourseReviewController {
  constructor(private readonly courseReviewService: CourseReviewService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  create(@Body() createReviewDto: CreateCourseReviewDto, @Request() req) {
    return this.courseReviewService.create(createReviewDto, req.user.id);
  }

  @Get('course/:courseId')
  @Roles(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN)
  findAll(@Param('courseId') courseId: string) {
    return this.courseReviewService.findAll(courseId);
  }

  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.courseReviewService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.STUDENT)
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateCourseReviewDto,
    @Request() req,
  ) {
    return this.courseReviewService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.courseReviewService.remove(id, req.user.id);
  }
}
