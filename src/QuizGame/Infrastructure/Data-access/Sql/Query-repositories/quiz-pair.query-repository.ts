import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizPairTypeormEntity } from '../Entities/quiz-pair-typeorm.entity';
import { Repository } from 'typeorm';
import { QuizAnswerTypeormEntity } from '../Entities/quiz-answer-typeorm.entity';
import { MapToViewQuizGame } from '../../../Mappers/quiz-game-view-model.mapper';
import { UserTypeormEntity } from '../../../../../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { QuizQuestionTypeormEntity } from '../Entities/quiz-question-typeorm.entity';
import {
  QuizMyStatisticType,
  QuizPairPagesType,
  QuizPairViewType,
} from '../../../../Api/Types/quiz-game-view-model.types';
import { AccessTokenPayloadType } from '../../../../../Common/Types/auth-payloads.types';
import { PairStatusEnum } from '../../../../Domain/Types/pair-status.enum';
import { QuizPairQueryType } from '../../../../Api/Types/quiz-game.input-query.types';

@Injectable()
export class QuizPairQueryRepository {
  constructor(
    @InjectRepository(QuizPairTypeormEntity)
    private quizPairRepository: Repository<QuizPairTypeormEntity>,
    @InjectRepository(QuizAnswerTypeormEntity)
    private playerPairProgressRepository: Repository<QuizAnswerTypeormEntity>,
    @InjectRepository(UserTypeormEntity)
    private userRepository: Repository<UserTypeormEntity>,
    @InjectRepository(QuizQuestionTypeormEntity)
    private questionRepository: Repository<QuizQuestionTypeormEntity>,
  ) {}

  async findPairById(pairId: string): Promise<QuizPairViewType | null> {
    const quizPair: QuizPairTypeormEntity | null = await this.quizPairRepository
      .createQueryBuilder('q')
      .select(['q'])
      .leftJoin('q.firstPlayer', 'fp')
      .leftJoin('q.secondPlayer', 'sp')
      .leftJoin('q.playersAnswers', 'pr')
      .leftJoin('q.questions', 'questions')
      .addSelect(['fp.login', 'sp.login', 'pr', 'questions'])
      .where({ id: pairId })
      .addOrderBy('questions.id', 'ASC')
      .addOrderBy('pr.addedAt', 'ASC')
      .getOne();

    if (!quizPair) {
      return null;
    }
    return MapToViewQuizGame.mapPair(quizPair);
  }

  async findPairsByPlayerId(
    playerInfo: AccessTokenPayloadType,
    query: QuizPairQueryType,
  ): Promise<QuizPairPagesType> {
    const toSkip: number = (query.pageNumber - 1) * query.pageSize;
    const [quizPair, totalCount] = await this.quizPairRepository
      .createQueryBuilder('q')
      .select(['q'])
      .leftJoin('q.firstPlayer', 'fp')
      .leftJoin('q.secondPlayer', 'sp')
      .leftJoin('q.playersAnswers', 'pr')
      .leftJoin('q.questions', 'questions')
      .addSelect(['fp.login', 'sp.login', 'pr', 'questions'])
      .where('q.firstPlayerId = :id OR q.secondPlayerId = :id', {
        id: playerInfo.sub,
      })
      .addOrderBy('questions.id', 'ASC')
      .addOrderBy('pr.addedAt', 'ASC')
      .addOrderBy(`q.${query.sortBy}`, `${query.sortDirection}`)
      .addOrderBy('q.pairCreatedDate', 'DESC')
      .skip(toSkip)
      .take(query.pageSize)
      .getManyAndCount();

    const items: QuizPairViewType[] = MapToViewQuizGame.mapPairs(quizPair);
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: items,
    };
  }

  async findActivePairByPlayerId(
    playerInfo: AccessTokenPayloadType,
  ): Promise<QuizPairViewType | null> {
    const quizPair: QuizPairTypeormEntity | null = await this.quizPairRepository
      .createQueryBuilder('q')
      .select(['q'])
      .leftJoin('q.firstPlayer', 'fp')
      .leftJoin('q.secondPlayer', 'sp')
      .leftJoin('q.playersAnswers', 'pr')
      .leftJoin('q.questions', 'questions')
      .addSelect(['fp.login', 'sp.login', 'pr', 'questions'])
      .where([
        { firstPlayerId: playerInfo.sub },
        { secondPlayerId: playerInfo.sub },
      ])
      .andWhere([
        { status: PairStatusEnum.Active },
        { status: PairStatusEnum.Pending },
      ])
      .addOrderBy('questions.id', 'ASC')
      .addOrderBy('pr.addedAt', 'ASC')
      .getOne();

    if (!quizPair) {
      return null;
    }
    return MapToViewQuizGame.mapPair(quizPair);
  }

  async getStatisctic(userId: string): Promise<QuizMyStatisticType> {
    const result: QuizMyStatisticType | undefined =
      await this.quizPairRepository
        .createQueryBuilder('q')
        .select([
          `COALESCE(SUM(CASE WHEN q.firstPlayerId = '${userId}' THEN q.firstPlayerScore ELSE q.secondPlayerScore END)::int, 0) as "sumScore"`,
          `COALESCE(ROUND(AVG(CASE WHEN q.firstPlayerId = '${userId}' THEN q.firstPlayerScore ELSE q.secondPlayerScore END),2)::float, 0) as "avgScores"`,
          'COUNT (*)::int as "gamesCount"',
          `COUNT (*) FILTER(WHERE (q.firstPlayerId = '${userId}' AND q.firstPlayerScore > q.secondPlayerScore) OR (q.secondPlayerId = '${userId}' AND q.secondPlayerScore > q.firstPlayerScore))::int as "winsCount"`,
          `COUNT (*) FILTER(WHERE (q.firstPlayerId = '${userId}' AND q.firstPlayerScore < q.secondPlayerScore) OR (q.secondPlayerId = '${userId}' AND q.secondPlayerScore < q.firstPlayerScore))::int as "lossesCount"`,
          `COUNT (*) FILTER(WHERE q.firstPlayerScore = q.secondPlayerScore)::int as "drawsCount"`,
        ])
        .where([{ firstPlayerId: userId }, { secondPlayerId: userId }])
        .getRawOne();

    return result!;
  }
}
