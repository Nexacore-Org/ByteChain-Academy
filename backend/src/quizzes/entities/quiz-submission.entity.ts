import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('quiz_submissions')
@Index(['userId', 'quizId'], { unique: true })
export class QuizSubmission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    quizId: string;

    @Column('simple-json')
    answers: Record<string, string>; // questionId -> answer

    @Column('decimal', { precision: 5, scale: 2 })
    score: number; // Percentage score (0-100)

    @Column()
    totalQuestions: number;

    @Column()
    correctAnswers: number;

    @Column({ default: false })
    passed: boolean; // Whether the user passed (typically >= 70%)

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizId' })
    quiz: Quiz;

    @CreateDateColumn()
    submittedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
