import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { QuizPairTypeormEntity } from '../Entities/quiz-pair.typeorm-entity';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { QuizPair } from '../../../../Domain/quiz-pair.entity';
import { QuizGameEntityMapper } from '../../../Mappers/quiz-game-entity.mapper';
import { QuizQuestion } from '../../../../Domain/quiz-question.entity';
import { QuizQuestionTypeormEntity } from '../Entities/quiz-question.typeorm-entity';
import { QuizAnswer } from '../../../../Domain/quiz-answer.entity';
import { GameDataType } from '../../../../Domain/Types/game-data.types';
import { PairStatusEnum } from '../../../../Domain/Types/pair-status.enum';

@Injectable()
export class QuizPairRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private getRepo(manager?: EntityManager): Repository<QuizPairTypeormEntity> {
    return (manager || this.dataSource).getRepository(QuizPairTypeormEntity);
  }

  async createNewQuizGame(
    quizPair: QuizPair,
    questions: QuizQuestion[],
    manager?: EntityManager,
  ): Promise<string> {
    const questionsTypeorm: QuizQuestionTypeormEntity[] =
      QuizGameEntityMapper.questionsToTypeormEntity(questions);
    const newQuizGameTypeormEntity: QuizPairTypeormEntity =
      QuizGameEntityMapper.pairToTypeormEntityCreate(
        quizPair,
        questionsTypeorm,
      );
    await this.getRepo(manager).save(newQuizGameTypeormEntity);
    return newQuizGameTypeormEntity.id;
  }

  async findExistingGame(manager?: EntityManager): Promise<QuizPair | null> {
    const existingGame: QuizPairTypeormEntity | null = await this.getRepo(
      manager,
    ).findOneBy({
      status: PairStatusEnum.Pending,
    });
    if (!existingGame) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(existingGame);
  }

  async update(quizPair: QuizPair, manager?: EntityManager): Promise<string> {
    const typeormEntity: QuizPairTypeormEntity =
      QuizGameEntityMapper.pairToTypeormEntityUpdate(quizPair);
    const result: QuizPairTypeormEntity =
      await this.getRepo(manager).save(typeormEntity);
    return result.id;
  }

  async findPairByPairId(
    id: string,
    manager?: EntityManager,
  ): Promise<QuizPair | null> {
    const neededPair: QuizPairTypeormEntity | null = await this.getRepo(
      manager,
    ).findOneBy({ id: id });
    if (!neededPair) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(neededPair);
  }

  async findPairByUserId(
    id: string,
    manager?: EntityManager,
  ): Promise<QuizPair | null> {
    const neededPair: QuizPairTypeormEntity | null = await this.getRepo(
      manager,
    ).findOneBy([{ firstPlayerId: id }, { secondPlayerId: id }]);
    if (!neededPair) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(neededPair);
  }

  async findActiveGameByUserId(
    id: string,
    manager?: EntityManager,
  ): Promise<QuizPair | null> {
    const neededPair: QuizPairTypeormEntity | null = await this.getRepo(
      manager,
    ).findOne({
      where: [
        { firstPlayerId: id, status: Not(PairStatusEnum.Finished) },
        { secondPlayerId: id, status: Not(PairStatusEnum.Finished) },
      ],
    });
    if (!neededPair) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(neededPair);
  }

  async getActiveGameDataByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<GameDataType | null> {
    const gameData: QuizPairTypeormEntity | null = await this.getRepo(manager)
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.questions', 'questions')
      .leftJoinAndSelect('q.playersAnswers', 'a')
      .where('q.status = :status', { status: 'Active' })
      .andWhere('(q.firstPlayerId = :userId OR q.secondPlayerId = :userId)', {
        userId,
      })
      .addOrderBy('questions.id', 'ASC')
      .addOrderBy('a.addedAt', 'ASC')
      .getOne();
    if (!gameData) {
      return null;
    }
    const questionsDomain: QuizQuestion[] =
      QuizGameEntityMapper.questionsToDomainEntity(gameData.questions);
    const answersDomain: QuizAnswer[] =
      QuizGameEntityMapper.answersToDomainEntity(gameData.playersAnswers);
    const pairDomain: QuizPair =
      QuizGameEntityMapper.pairToDomainEntity(gameData);
    return {
      questions: questionsDomain,
      answers: answersDomain,
      pair: pairDomain,
    };
  }
}
