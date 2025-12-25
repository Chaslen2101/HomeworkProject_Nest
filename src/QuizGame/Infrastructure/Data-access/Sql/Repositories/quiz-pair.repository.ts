import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizPairTypeormEntity } from '../Entities/quiz-pair-typeorm.entity';
import { Repository } from 'typeorm';
import { QuizAnswerTypeormEntity } from '../Entities/quiz-answer-typeorm.entity';
import { QuizPair } from '../../../../Domain/quiz-pair.entity';
import { QuizGameEntityMapper } from '../../../Mappers/quiz-game-entity.mapper';
import { QuizQuestion } from '../../../../Domain/quiz-question.entity';
import { QuizQuestionTypeormEntity } from '../Entities/quiz-question-typeorm.entity';
import { QuizAnswer } from '../../../../Domain/quiz-answer.entity';
import { GameDataType } from '../../../../Domain/Types/game-data.types';
import { PairStatusEnum } from '../../../../Domain/Types/pair-status.enum';

@Injectable()
export class QuizPairRepository {
  constructor(
    @InjectRepository(QuizPairTypeormEntity)
    private readonly quizPairRepository: Repository<QuizPairTypeormEntity>,
    @InjectRepository(QuizAnswerTypeormEntity)
    private readonly playerPairProgressRepository: Repository<QuizAnswerTypeormEntity>,
  ) {}

  async createNewQuizGame(
    quizPair: QuizPair,
    questions: QuizQuestion[],
  ): Promise<string> {
    const questionsTypeorm: QuizQuestionTypeormEntity[] =
      QuizGameEntityMapper.questionsToTypeormEntity(questions);
    const newQuizGameTypeormEntity: QuizPairTypeormEntity =
      QuizGameEntityMapper.pairToTypeormEntityCreate(
        quizPair,
        questionsTypeorm,
      );
    await this.quizPairRepository.save(newQuizGameTypeormEntity);
    return newQuizGameTypeormEntity.id;
  }

  async findExistingGame(): Promise<QuizPair | null> {
    const existingGame: QuizPairTypeormEntity | null =
      await this.quizPairRepository.findOneBy({
        status: PairStatusEnum.Pending,
      });
    if (!existingGame) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(existingGame);
  }

  async update(quizPair: QuizPair): Promise<string> {
    const typeormEntity: QuizPairTypeormEntity =
      QuizGameEntityMapper.pairToTypeormEntityUpdate(quizPair);
    const result = await this.quizPairRepository.save(typeormEntity);
    return result.id;
  }

  async findPairByPairId(id: string): Promise<QuizPair | null> {
    const neededPair: QuizPairTypeormEntity | null =
      await this.quizPairRepository.findOneBy({ id: id });
    if (!neededPair) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(neededPair);
  }

  async findPairByUserId(id: string): Promise<QuizPair | null> {
    const neededPair: QuizPairTypeormEntity | null =
      await this.quizPairRepository.findOneBy([
        { firstPlayerId: id },
        { secondPlayerId: id },
      ]);
    if (!neededPair) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(neededPair);
  }

  async getActiveGameData(userId: string): Promise<GameDataType | null> {
    const gameData: QuizPairTypeormEntity | null = await this.quizPairRepository
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
