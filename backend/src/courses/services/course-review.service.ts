import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseReview } from '../entities/course-review.entity';
import { Course } from '../entities/course.entity';
import { CreateCourseReviewDto } from '../dto/create-course-review.dto';
import { UpdateCourseReviewDto } from '../dto/update-course-review.dto';

@Injectable()
export class CourseReviewService {
  constructor(
    @InjectRepository(CourseReview)
    private readonly reviewRepository: Repository<CourseReview>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(
    createReviewDto: CreateCourseReviewDto,
    studentId: string,
  ): Promise<CourseReview> {
    const course = await this.courseRepository.findOne({
      where: { id: createReviewDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if student has already reviewed this course
    const existingReview = await this.reviewRepository.findOne({
      where: {
        courseId: createReviewDto.courseId,
        studentId: studentId,
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this course');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      studentId,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update course average rating and total reviews
    await this.updateCourseRating(course.id);

    return savedReview;
  }

  async findAll(courseId: string): Promise<CourseReview[]> {
    return this.reviewRepository.find({
      where: { courseId },
      relations: ['student'],
    });
  }

  async findOne(id: string): Promise<CourseReview> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateCourseReviewDto,
    studentId: string,
  ): Promise<CourseReview> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.studentId !== studentId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);

    // Update course average rating
    await this.updateCourseRating(review.courseId);

    return updatedReview;
  }

  async remove(id: string, studentId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.studentId !== studentId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);

    // Update course average rating
    await this.updateCourseRating(review.courseId);
  }

  private async updateCourseRating(courseId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { courseId },
    });

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (reviews.length === 0) {
      course.averageRating = 0;
      course.totalReviews = 0;
    } else {
      const totalRating = reviews.reduce(
        (sum, review) => sum + Number(review.rating),
        0,
      );
      course.averageRating = totalRating / reviews.length;
      course.totalReviews = reviews.length;
    }

    await this.courseRepository.save(course);
  }
}
