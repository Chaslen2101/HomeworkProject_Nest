import { QuizPair } from '../../Domain/quiz-pair.entity';
import { QuizPairTypeormEntity } from '../Data-access/Sql/Entities/quiz-pair.typeorm-entity';
import { QuizQuestion } from '../../Domain/quiz-question.entity';
import { QuizQuestionTypeormEntity } from '../Data-access/Sql/Entities/quiz-question.typeorm-entity';
import { QuizAnswer } from '../../Domain/quiz-answer.entity';
import { QuizAnswerTypeormEntity } from '../Data-access/Sql/Entities/quiz-answer.typeorm-entity';
import { QuizStatisticTypeormEntity } from '../Data-access/Sql/Entities/quiz-statistic.typeorm-entity';
import { QuizStatistic } from '../../Domain/quiz-statistic.entity';

export class QuizGameEntityMapper {
  static pairToTypeormEntityCreate(
    pairDomain: QuizPair,
    questions: QuizQuestionTypeormEntity[],
  ): QuizPairTypeormEntity {
    const typeormEntity: QuizPairTypeormEntity = new QuizPairTypeormEntity();
    typeormEntity.id = pairDomain.id;
    typeormEntity.status = pairDomain.status;
    typeormEntity.pairCreatedDate = pairDomain.pairCreatedDate;
    typeormEntity.startGameDate = pairDomain.startGameDate;
    typeormEntity.finishGameDate = pairDomain.finishGameDate;
    typeormEntity.firstPlayerId = pairDomain.firstPlayerId;
    typeormEntity.secondPlayerId = pairDomain.secondPlayerId;
    typeormEntity.questions = questions;
    typeormEntity.firstPlayerScore = pairDomain.firstPlayerScore;
    typeormEntity.secondPlayerScore = pairDomain.secondPlayerScore;
    return typeormEntity;
  }

  static pairToTypeormEntityUpdate(
    pairDomain: QuizPair,
  ): QuizPairTypeormEntity {
    const typeormEntity: QuizPairTypeormEntity = new QuizPairTypeormEntity();
    typeormEntity.id = pairDomain.id;
    typeormEntity.status = pairDomain.status;
    typeormEntity.pairCreatedDate = pairDomain.pairCreatedDate;
    typeormEntity.startGameDate = pairDomain.startGameDate;
    typeormEntity.finishGameDate = pairDomain.finishGameDate;
    typeormEntity.firstPlayerId = pairDomain.firstPlayerId;
    typeormEntity.secondPlayerId = pairDomain.secondPlayerId;
    typeormEntity.firstPlayerScore = pairDomain.firstPlayerScore;
    typeormEntity.secondPlayerScore = pairDomain.secondPlayerScore;
    return typeormEntity;
  }

  static pairToDomainEntity(pairTypeorm: QuizPairTypeormEntity): QuizPair {
    return new QuizPair(
      pairTypeorm.id,
      pairTypeorm.firstPlayerId,
      pairTypeorm.secondPlayerId,
      pairTypeorm.status,
      pairTypeorm.pairCreatedDate,
      pairTypeorm.startGameDate,
      pairTypeorm.finishGameDate,
      pairTypeorm.firstPlayerScore,
      pairTypeorm.secondPlayerScore,
    );
  }

  static questionToTypeormEntity(
    questionDomain: QuizQuestion,
  ): QuizQuestionTypeormEntity {
    const typeormEntity: QuizQuestionTypeormEntity =
      new QuizQuestionTypeormEntity();
    typeormEntity.id = questionDomain.id;
    typeormEntity.body = questionDomain.body;
    typeormEntity.correctAnswers = questionDomain.correctAnswers;
    typeormEntity.published = questionDomain.published;
    typeormEntity.createdAt = questionDomain.createdAt;
    typeormEntity.updatedAt = questionDomain.updatedAt;
    return typeormEntity;
  }

  static questionToDomainEntity(
    questionTypeorm: QuizQuestionTypeormEntity,
  ): QuizQuestion {
    return new QuizQuestion(
      questionTypeorm.id,
      questionTypeorm.body,
      questionTypeorm.correctAnswers,
      questionTypeorm.published,
      questionTypeorm.createdAt,
      questionTypeorm.updatedAt,
    );
  }

  static questionsToTypeormEntity(
    questionDomain: QuizQuestion[],
  ): QuizQuestionTypeormEntity[] {
    return questionDomain.map((questionDomain) => {
      const typeormEntity: QuizQuestionTypeormEntity =
        new QuizQuestionTypeormEntity();
      typeormEntity.id = questionDomain.id;
      typeormEntity.body = questionDomain.body;
      typeormEntity.correctAnswers = questionDomain.correctAnswers;
      typeormEntity.published = questionDomain.published;
      typeormEntity.createdAt = questionDomain.createdAt;
      typeormEntity.updatedAt = questionDomain.updatedAt;
      return typeormEntity;
    });
  }

  static questionsToDomainEntity(
    questionTypeorm: QuizQuestionTypeormEntity[],
  ): QuizQuestion[] {
    return questionTypeorm.map((questionTypeorm) => {
      return new QuizQuestion(
        questionTypeorm.id,
        questionTypeorm.body,
        questionTypeorm.correctAnswers,
        questionTypeorm.published,
        questionTypeorm.createdAt,
        questionTypeorm.updatedAt,
      );
    });
  }

  static answersToDomainEntity(
    answersTypeorm: QuizAnswerTypeormEntity[],
  ): QuizAnswer[] {
    return answersTypeorm.map((a) => {
      return new QuizAnswer(
        a.id,
        a.userId,
        a.pairId,
        a.questionId,
        a.answer,
        a.answerStatus,
        a.addedAt,
      );
    });
  }

  static answerToTypeormEntity(
    answerDomain: QuizAnswer,
  ): QuizAnswerTypeormEntity {
    const typeormEntity: QuizAnswerTypeormEntity =
      new QuizAnswerTypeormEntity();
    typeormEntity.id = answerDomain.id;
    typeormEntity.userId = answerDomain.userId;
    typeormEntity.pairId = answerDomain.pairId;
    typeormEntity.questionId = answerDomain.questionId;
    typeormEntity.answer = answerDomain.answer;
    typeormEntity.answerStatus = answerDomain.answerStatus;
    typeormEntity.addedAt = answerDomain.addedAt;
    return typeormEntity;
  }

  static answerToDomainEntity(
    answerTypeorm: QuizAnswerTypeormEntity,
  ): QuizAnswer {
    return new QuizAnswer(
      answerTypeorm.id,
      answerTypeorm.userId,
      answerTypeorm.pairId,
      answerTypeorm.questionId,
      answerTypeorm.answer,
      answerTypeorm.answerStatus,
      answerTypeorm.addedAt,
    );
  }

  static statisticToTypeormEntity(
    statisticDomain: QuizStatistic,
  ): QuizStatisticTypeormEntity {
    const typeormEntity: QuizStatisticTypeormEntity =
      new QuizStatisticTypeormEntity();
    typeormEntity.userId = statisticDomain.userId;
    typeormEntity.sumScore = statisticDomain.sumScore;
    typeormEntity.avgScores = statisticDomain.avgScores;
    typeormEntity.gamesCount = statisticDomain.gamesCount;
    typeormEntity.winsCount = statisticDomain.winsCount;
    typeormEntity.lossesCount = statisticDomain.lossesCount;
    typeormEntity.drawsCount = statisticDomain.drawsCount;
    return typeormEntity;
  }

  static statisticToDomainEntity(
    statisticTypeorm: QuizStatisticTypeormEntity,
  ): QuizStatistic {
    return new QuizStatistic(
      statisticTypeorm.userId,
      statisticTypeorm.sumScore,
      statisticTypeorm.avgScores,
      statisticTypeorm.gamesCount,
      statisticTypeorm.winsCount,
      statisticTypeorm.lossesCount,
      statisticTypeorm.drawsCount,
    );
  }
}
