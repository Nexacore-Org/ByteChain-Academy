// recommendation.rules.ts
import { Recommendation } from './interfaces/recommendation.interface';

interface Lesson {
  courseId: string;
}

export function applyRules(lessonHistory: Lesson[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (lessonHistory.some((lesson) => lesson.courseId === 'course-a')) {
    recommendations.push({
      courseId: 'course-b',
      reason: 'Completed Course A (via courseProgress)',
    });
  }

  return recommendations;
}
