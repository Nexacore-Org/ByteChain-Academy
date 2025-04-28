import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { Lesson } from 'src/lessons/entities/lessons.entity';

@Entity('courses')
export class Course {
  @ApiProperty({ description: 'The unique identifier of the course' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The title of the course' })
  @Column({ length: 100, nullable: false })
  title: string;

  @ApiProperty({ description: 'The description of the course' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'The difficulty level of the course' })
  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level: string;

  @ApiProperty({ description: 'The price of the course' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({ description: 'Whether the course is published' })
  @Column({ default: false })
  isPublished: boolean;

  @ApiProperty({ description: 'The duration of the course in hours' })
  @Column({ type: 'float', nullable: true })
  duration: number;

  @ApiProperty({ description: 'The URL of the course thumbnail' })
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ApiProperty({
    type: () => [Quiz],
    description: 'The quizzes in this course',
  })
  @OneToMany(() => Quiz, (quiz) => quiz.course)
  quizzes: Quiz[];

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @ApiProperty({ description: 'When the course was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the course was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
