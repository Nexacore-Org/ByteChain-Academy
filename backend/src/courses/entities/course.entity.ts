import { Lesson } from '../../lessons/entities/lesson.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { CourseRegistration } from './course-registration.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'varchar', nullable: true })
  difficulty: string | null;

  @Column({ type: 'simple-json', default: '[]' })
  tags: string[];

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl: string | null;

  @OneToMany(() => CourseRegistration, (registration) => registration.course)
  registrations: CourseRegistration[];

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Soft-delete field for admin restore functionality
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
