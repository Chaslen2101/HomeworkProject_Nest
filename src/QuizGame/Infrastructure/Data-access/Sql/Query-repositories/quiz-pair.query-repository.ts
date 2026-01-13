import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizPairTypeormEntity } from '../Entities/quiz-pair.typeorm-entity';
import { Repository } from 'typeorm';
import { QuizAnswerTypeormEntity } from '../Entities/quiz-answer.typeorm-entity';
import { MapToViewQuizGame } from '../../../Mappers/quiz-game-view-model.mapper';
import { UserTypeormEntity } from '../../../../../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { QuizQuestionTypeormEntity } from '../Entities/quiz-question.typeorm-entity';
import {
  QuizPairPagesType,
  QuizPairViewType,
} from '../../../../Api/Types/quiz-game-view-model.types';
import { AccessTokenPayloadType } from '../../../../../Common/Types/auth-payloads.types';
import { PairStatusEnum } from '../../../../Domain/Types/pair-status.enum';
import { QuizPairSanitizedQueryType } from '../../../../Api/Types/quiz-game.input-query.types';

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
    query: QuizPairSanitizedQueryType,
  ): Promise<QuizPairPagesType> {
    const toSkip = (query.pageNumber - 1) * query.pageSize;

    const [idsResult, totalCount] = await this.quizPairRepository
      .createQueryBuilder('q')
      .select('q.id')
      .where('q.firstPlayerId = :id OR q.secondPlayerId = :id', {
        id: playerInfo.sub,
      })
      .orderBy(`q.${query.sortBy}`, query.sortDirection)
      .addOrderBy('q.pairCreatedDate', 'DESC')
      .skip(toSkip)
      .take(query.pageSize)
      .getManyAndCount();

    const ids: string[] = idsResult.map((item) => item.id);

    if (ids.length === 0) {
      return {
        pagesCount: 0,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: 0,
        items: [],
      };
    }
    const quizPairs = await this.quizPairRepository
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.firstPlayer', 'fp')
      .leftJoinAndSelect('q.secondPlayer', 'sp')
      .leftJoinAndSelect('q.questions', 'questions')
      .leftJoinAndSelect('q.playersAnswers', 'pr')
      .where('q.id IN (:...ids)', { ids })
      .orderBy(`q.${query.sortBy}`, query.sortDirection)
      .addOrderBy('q.pairCreatedDate', 'DESC')
      .addOrderBy('questions.id', 'ASC')
      .addOrderBy('pr.addedAt', 'ASC')
      .getMany();

    const items: QuizPairViewType[] = MapToViewQuizGame.mapPairs(quizPairs);

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
}
