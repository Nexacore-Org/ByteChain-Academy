import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Quiz } from './quiz.entity';

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
}

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    text: string;

    @Column({
        type: 'varchar',
        default: QuestionType.MULTIPLE_CHOICE,
    })
    type: QuestionType;

    @Column('simple-json')
    options: string[];

    @Column()
    correctAnswer: string;

    @Column()
    quizId: string;

    @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
    quiz: Quiz;
}
