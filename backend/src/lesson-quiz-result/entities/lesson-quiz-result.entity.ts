import { Student } from 'src/student/entities/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class LessonQuizResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  lessonName: string;

  @Column('float')
  score: number;

  @Column()
  type: 'lesson' | 'quiz';

  @CreateDateColumn()
  completedAt: Date;

  @ManyToOne(() => Student, (student) => student.lessonQuizResults, {
    onDelete: 'CASCADE',
  })
  student: Student;
}
