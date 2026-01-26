import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { Lesson } from '../entities/lesson.entity';
import { CreateQuizDto, UpdateQuizDto } from '../dto/quiz.dto';

@Injectable()
export class QuizzesService {
    constructor(
        @InjectRepository(Quiz)
        private quizRepository: Repository<Quiz>,
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
        @InjectRepository(Lesson)
        private lessonRepository: Repository<Lesson>,
    ) { }

    async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
        const lesson = await this.lessonRepository.findOne({ where: { id: createQuizDto.lessonId } });
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${createQuizDto.lessonId} not found`);
        }

        const existingQuiz = await this.quizRepository.findOne({ where: { lessonId: createQuizDto.lessonId } });
        if (existingQuiz) {
            throw new ConflictException(`Lesson already has an associated quiz`);
        }

        const quiz = this.quizRepository.create({
            title: createQuizDto.title,
            description: createQuizDto.description,
            lessonId: createQuizDto.lessonId,
        });

        const savedQuiz = await this.quizRepository.save(quiz);

        if (createQuizDto.questions && createQuizDto.questions.length > 0) {
            const questions = createQuizDto.questions.map(q =>
                this.questionRepository.create({ ...q, quizId: savedQuiz.id })
            );
            await this.questionRepository.save(questions);
            savedQuiz.questions = questions;
        }

        return savedQuiz;
    }

    async findByLessonId(lessonId: string): Promise<Quiz> {
        const quiz = await this.quizRepository.findOne({
            where: { lessonId },
            relations: ['questions'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz for lesson ID ${lessonId} not found`);
        }

        return quiz;
    }

    async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
        const quiz = await this.quizRepository.findOne({
            where: { id },
            relations: ['questions'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }

        if (updateQuizDto.title) quiz.title = updateQuizDto.title;
        if (updateQuizDto.description) quiz.description = updateQuizDto.description;

        if (updateQuizDto.questions) {
            // Simple approach: delete old questions and insert new ones
            await this.questionRepository.delete({ quizId: id });
            const questions = updateQuizDto.questions.map(q =>
                this.questionRepository.create({ ...q, quizId: id })
            );
            await this.questionRepository.save(questions);
            quiz.questions = questions;
        }

        return this.quizRepository.save(quiz);
    }

    async findOne(id: string): Promise<Quiz> {
        const quiz = await this.quizRepository.findOne({
            where: { id },
            relations: ['questions'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }

        return quiz;
    }
}
