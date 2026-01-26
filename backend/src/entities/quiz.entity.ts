import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Question } from './question.entity';

@Entity('quizzes')
export class Quiz {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text', { nullable: true })
    description: string;

    @Column()
    lessonId: string;

    @OneToOne(() => Lesson, (lesson) => lesson.quiz, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
    questions: Question[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
