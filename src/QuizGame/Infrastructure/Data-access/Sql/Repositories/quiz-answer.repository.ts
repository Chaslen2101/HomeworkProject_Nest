import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizAnswerTypeormEntity } from '../Entities/quiz-answer-typeorm.entity';
import { Repository } from 'typeorm';
import { QuizAnswer } from '../../../../Domain/quiz-answer.entity';
import { QuizGameEntityMapper } from '../../../Mappers/quiz-game-entity.mapper';

@Injectable()
export class QuizAnswerRepository {
  constructor(
    @InjectRepository(QuizAnswerTypeormEntity)
    private quizAnswerRepository: Repository<QuizAnswerTypeormEntity>,
  ) {}
  async createNewAnswer(answer: QuizAnswer): Promise<string> {
    const typeormEntity: QuizAnswerTypeormEntity =
      QuizGameEntityMapper.answerToTypeormEntity(answer);
    await this.quizAnswerRepository.save(typeormEntity);
    return typeormEntity.id;
  }
}
