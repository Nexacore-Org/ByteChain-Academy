export type BadgeMilestoneType = 'lessons_completed' | 'courses_completed';

export interface BadgeMilestone {
  key: string;
  name: string;
  description: string;
  icon?: string;
  type: BadgeMilestoneType;
  threshold: number;
}

export const BADGE_MILESTONES: BadgeMilestone[] = [
  {
    key: 'lessons_1',
    name: 'First Lesson',
    description: 'Complete your first lesson.',
    icon: '📘',
    type: 'lessons_completed',
    threshold: 1,
  },
  {
    key: 'lessons_5',
    name: 'Lesson Explorer',
    description: 'Complete 5 lessons.',
    icon: '🧭',
    type: 'lessons_completed',
    threshold: 5,
  },
  {
    key: 'lessons_10',
    name: 'Lesson Apprentice',
    description: 'Complete 10 lessons.',
    icon: '🧠',
    type: 'lessons_completed',
    threshold: 10,
  },
  {
    key: 'courses_1',
    name: 'First Course',
    description: 'Complete your first course.',
    icon: '🎓',
    type: 'courses_completed',
    threshold: 1,
  },
  {
    key: 'courses_3',
    name: 'Course Collector',
    description: 'Complete 3 courses.',
    icon: '🏅',
    type: 'courses_completed',
    threshold: 3,
  },
  {
    key: 'courses_5',
    name: 'Course Master',
    description: 'Complete 5 courses.',
    icon: '👑',
    type: 'courses_completed',
    threshold: 5,
  },
];
