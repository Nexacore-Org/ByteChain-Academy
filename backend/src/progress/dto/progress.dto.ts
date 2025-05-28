export class CreateProgressDto {
  studentId: number;
  courseId: number;
  completedLessons: number;
  completedQuizzes: number;
  courseCompletionPercentage: number;
}
