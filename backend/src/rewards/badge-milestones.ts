export type MilestoneRule =
  | { kind: 'xp'; min: number }
  | { kind: 'lessons'; min: number }
  | { kind: 'courses'; min: number }
  | { kind: 'quiz_passes'; min: number };

export interface BadgeMilestone {
  key: string;
  name: string;
  description: string;
  iconUrl?: string;
  /** Eligibility evaluated in {@link RewardsService.checkAndAwardBadges} */
  rule: MilestoneRule;
}

/** Five milestone badges; eligibility uses XP and/or activity counts. */
export const BADGE_MILESTONES: BadgeMilestone[] = [
  {
    key: 'first_lesson',
    name: 'First Lesson',
    description: 'Complete your first lesson.',
    iconUrl: '📘',
    rule: { kind: 'lessons', min: 1 },
  },
  {
    key: 'five_lessons',
    name: 'Five Lessons',
    description: 'Complete five lessons.',
    iconUrl: '🧭',
    rule: { kind: 'lessons', min: 5 },
  },
  {
    key: 'first_quiz_pass',
    name: 'First Quiz Pass',
    description: 'Pass a quiz.',
    iconUrl: '✅',
    rule: { kind: 'quiz_passes', min: 1 },
  },
  {
    key: 'course_completer',
    name: 'Course Completer',
    description: 'Complete a full course.',
    iconUrl: '🎓',
    rule: { kind: 'courses', min: 1 },
  },
  {
    key: 'xp_500',
    name: '500 XP Club',
    description: 'Accumulate 500 total experience points.',
    iconUrl: '🏆',
    rule: { kind: 'xp', min: 500 },
  },
];
