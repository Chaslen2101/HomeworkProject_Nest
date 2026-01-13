import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { QuizAnswerTypeormEntity } from '../Entities/quiz-answer.typeorm-entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { QuizAnswer } from '../../../../Domain/quiz-answer.entity';
import { QuizGameEntityMapper } from '../../../Mappers/quiz-game-entity.mapper';

@Injectable()
export class QuizAnswerRepository {
  constructor(
    @InjectRepository(QuizAnswerTypeormEntity)
    private quizAnswerRepository: Repository<QuizAnswerTypeormEntity>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private getRepo(
    manager?: EntityManager,
  ): Repository<QuizAnswerTypeormEntity> {
    return (manager || this.dataSource).getRepository(QuizAnswerTypeormEntity);
  }

  async createNewAnswer(
    answer: QuizAnswer,
    manager?: EntityManager,
  ): Promise<string> {
    const typeormEntity: QuizAnswerTypeormEntity =
      QuizGameEntityMapper.answerToTypeormEntity(answer);
    await this.getRepo(manager).save(typeormEntity);
    return typeormEntity.id;
  }
}
