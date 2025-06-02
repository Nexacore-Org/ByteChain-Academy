import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { QuizQuestion } from './quiz-question.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { Course } from 'src/course/entities/course.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lessonId: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  type: string;

  @Column()
  difficulty: string;

  @Column()
  status: string;

  @Column()
  totalQuestions: number;

  @Column()
  passingScore: number;

  @Column({ type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ type: 'int', nullable: true })
  timeLimit: number;

  @OneToMany(() => QuizQuestion, (quizQuestion) => quizQuestion.quiz)
  questions: QuizQuestion[];

  @OneToMany(() => QuizAttempt, (quizAttempt) => quizAttempt.quiz)
  attempts: QuizAttempt[];

  @OneToMany(() => Course, (course) => course.quizzes)
  course: Course[];
}
