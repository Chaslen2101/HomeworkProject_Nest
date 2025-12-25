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
      QuizGameEntityMapper.pairToTypeormEntity(quizPair, questionsTypeorm);
    await this.quizPairRepository.save(newQuizGameTypeormEntity);
    return newQuizGameTypeormEntity.id;
  }

  async findExistingGame(): Promise<QuizPair | null> {
    const existingGame: QuizPairTypeormEntity | null =
      await this.quizPairRepository.findOneBy({
        status: 'PendingSecondPlayer',
      });
    if (!existingGame) {
      return null;
    }
    return QuizGameEntityMapper.pairToDomainEntity(existingGame);
  }

  async addSecondPlayer(quizPair: QuizPair): Promise<boolean> {
    const result = await this.quizPairRepository.update(
      { id: quizPair.id },
      {
        secondPlayerId: quizPair.secondPlayerId,
        status: quizPair.status,
        startGameDate: quizPair.startGameDate,
      },
    );
    return result.affected != 0;
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
      // 1. Джоиним вопросы (ManyToMany)
      .leftJoinAndSelect('q.questions', 'questions')
      // 2. Джоиним только ответы ЭТОГО пользователя (фильтрация прямо в JOIN)
      .leftJoinAndSelect('q.playersAnswers', 'a', 'a.userId = :userId', {
        userId,
      })
      // 3. Ищем только активную игру этого пользователя
      .where('q.status = :status', { status: 'Active' })
      .andWhere('(q.firstPlayerId = :userId OR q.secondPlayerId = :userId)', {
        userId,
      })
      // 4. Сортируем вопросы по ID (стабильный порядок)
      .addOrderBy('questions.id', 'ASC')
      // 5. Сортируем ответы по времени (чтобы понять хронологию)
      .addOrderBy('a.addedAt', 'ASC')
      .getOne();
    if (!gameData) {
      return null;
    }
    const questionsDomain: QuizQuestion[] =
      QuizGameEntityMapper.questionsToDomainEntity(gameData.questions);
    const answersDomain: QuizAnswer[] =
      QuizGameEntityMapper.answersToDomainEntity(gameData.playersAnswers);
    return {
      questions: questionsDomain,
      answers: answersDomain,
      pairId: gameData.id,
    };
  }
}
