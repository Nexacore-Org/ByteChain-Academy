import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Course } from './course.entity';

@Entity('course_registrations')
export class CourseRegistration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Course, (course) => course.registrations, { eager: false })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @Column()
    courseId: string;

    @CreateDateColumn()
    enrolledAt: Date;
}
