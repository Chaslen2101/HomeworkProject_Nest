import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionTypeormEntity } from '../Entities/quiz-question.typeorm-entity';
import { QuizQuestion } from '../../../../Domain/quiz-question.entity';
import { QuizGameEntityMapper } from '../../../Mappers/quiz-game-entity.mapper';
import { Repository } from 'typeorm';

@Injectable()
export class QuizQuestionRepository {
  constructor(
    @InjectRepository(QuizQuestionTypeormEntity)
    private questionRepository: Repository<QuizQuestionTypeormEntity>,
  ) {}

  async createNewQuestion(questionDomain: QuizQuestion): Promise<string> {
    const newQuestionTypeorm: QuizQuestionTypeormEntity =
      QuizGameEntityMapper.questionToTypeormEntity(questionDomain);
    const result: QuizQuestionTypeormEntity =
      await this.questionRepository.save(newQuestionTypeorm);
    return result.id;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await this.questionRepository.delete(id);
    return result.affected != 0;
  }

  async findById(id: string): Promise<QuizQuestion | null> {
    const questionTypeorm: QuizQuestionTypeormEntity | null =
      await this.questionRepository.findOneBy({ id: id });
    if (!questionTypeorm) {
      return null;
    }
    return QuizGameEntityMapper.questionToDomainEntity(questionTypeorm);
  }

  async update(question: QuizQuestion): Promise<string> {
    const typeormQuestion: QuizQuestionTypeormEntity =
      QuizGameEntityMapper.questionToTypeormEntity(question);
    const result: QuizQuestionTypeormEntity =
      await this.questionRepository.save(typeormQuestion);
    return result.id;
  }

  async getRandomQuestion(): Promise<QuizQuestion[]> {
    const randomQuestions: QuizQuestionTypeormEntity[] | null =
      await this.questionRepository
        .createQueryBuilder('q')
        .orderBy('RANDOM()')
        .take(5)
        .getMany();
    return QuizGameEntityMapper.questionsToDomainEntity(randomQuestions);
  }
}
