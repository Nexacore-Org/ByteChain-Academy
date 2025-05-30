// recommendation.rules.ts
import { Recommendation } from './interfaces/recommendation.interface';

interface Lesson {
  courseId: string;
}

interface QuizResult {
  passed: boolean;
  courseId: string;
}

interface CourseProgress {
  courseId: string;
  progress: number;
  completed: boolean;
}

export function applyRules(
  lessonHistory: Lesson[],
  quizResults: QuizResult[],
  courseProgress: CourseProgress[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const completedCourses = courseProgress
    .filter((p) => p.completed)
    .map((p) => p.courseId);

  if (completedCourses.includes('course-a')) {
    recommendations.push({
      courseId: 'course-b',
      reason: 'Completed Course A (via courseProgress)',
    });
  }

  return recommendations;
}
