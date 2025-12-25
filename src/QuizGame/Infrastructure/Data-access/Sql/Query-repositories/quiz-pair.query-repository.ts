import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizPairTypeormEntity } from '../Entities/quiz-pair-typeorm.entity';
import { Repository } from 'typeorm';
import { QuizAnswerTypeormEntity } from '../Entities/quiz-answer-typeorm.entity';
import { MapToViewQuizGame } from '../../../Mappers/quiz-game-view-model.mapper';
import { UserTypeormEntity } from '../../../../../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { QuizQuestionTypeormEntity } from '../Entities/quiz-question-typeorm.entity';
import { QuizPairViewType } from '../../../../Api/Types/quiz-game-view-model.types';
import { AccessTokenPayloadType } from '../../../../../Common/Types/auth-payloads.types';
import { PairStatusEnum } from '../../../../Domain/Types/pair-status.enum';

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

  async findPairByPlayerId(
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
      .addOrderBy('questions.id', 'ASC')
      .addOrderBy('pr.addedAt', 'ASC')
      .getOne();

    if (!quizPair) {
      return null;
    }
    return MapToViewQuizGame.mapPair(quizPair);
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
      .andWhere({ status: PairStatusEnum.Active })
      .addOrderBy('questions.id', 'ASC')
      .addOrderBy('pr.addedAt', 'ASC')
      .getOne();

    if (!quizPair) {
      return null;
    }
    return MapToViewQuizGame.mapPair(quizPair);
  }
}
