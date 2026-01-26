import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne } from 'typeorm';
import { Course } from './course.entity';
import { Quiz } from './quiz.entity';

@Entity('lessons')
export class Lesson {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column({ default: 0 })
    order: number;

    @Column()
    courseId: string;

    @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
    course: Course;

    @OneToOne(() => Quiz, (quiz) => quiz.lesson)
    quiz: Quiz;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
