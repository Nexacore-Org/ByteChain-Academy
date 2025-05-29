import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from 'src/student/entities/student.entity';
import { Tutor } from 'src/tutor/entities/tutor.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => Student, { nullable: true, onDelete: 'CASCADE' })
  student?: Student;

  @ManyToOne(() => Tutor, { nullable: true, onDelete: 'CASCADE' })
  tutor?: Tutor;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}