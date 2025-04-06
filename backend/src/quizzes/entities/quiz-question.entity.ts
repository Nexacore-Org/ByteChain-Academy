import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Quiz } from './quiz.entity';


@Entity('quiz_questions')
export class QuizQuestion {
@PrimaryGeneratedColumn()
id: number;

@Column()
quizId: number;

@Column()
questionText: string;

@Column()
questionType: string;

@Column()
points: number;

@Column()
order: number;

@Column('simple-array', { nullable: true })
correctAnswer: string[];

@ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
quiz: Quiz;
}