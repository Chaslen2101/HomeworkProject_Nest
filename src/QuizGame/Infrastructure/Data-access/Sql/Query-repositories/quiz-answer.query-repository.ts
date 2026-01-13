import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizAnswerTypeormEntity } from '../Entities/quiz-answer.typeorm-entity';
import { Repository } from 'typeorm';
import { QuizGameEntityMapper } from '../../../Mappers/quiz-game-entity.mapper';
import { QuizAnswer } from '../../../../Domain/quiz-answer.entity';
import { MapToViewQuizGame } from '../../../Mappers/quiz-game-view-model.mapper';
import { QuizAnswerViewType } from '../../../../Api/Types/quiz-game-view-model.types';

@Injectable()
export class QuizAnswerQueryRepository {
  constructor(
    @InjectRepository(QuizAnswerTypeormEntity)
    private quizAnswerRepository: Repository<QuizAnswerTypeormEntity>,
  ) {}

  async findAnswerById(id: string): Promise<QuizAnswerViewType | null> {
    const neededAnswer: QuizAnswerTypeormEntity | null =
      await this.quizAnswerRepository.findOneBy({ id: id });
    if (!neededAnswer) {
      return null;
    }
    return MapToViewQuizGame.mapAnswer(neededAnswer);
  }
}
