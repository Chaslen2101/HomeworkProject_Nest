import {
  QuizQuestionSAViewType,
  QuizPairViewType,
  QuizAnswerViewType,
  QuizQuestionViewType,
  QuizStatisticViewType,
  QuizStatisticTop10ViewType,
} from '../../Api/Types/quiz-game-view-model.types';
import { QuizQuestionTypeormEntity } from '../Data-access/Sql/Entities/quiz-question.typeorm-entity';
import { QuizPairTypeormEntity } from '../Data-access/Sql/Entities/quiz-pair.typeorm-entity';
import { QuizAnswerTypeormEntity } from '../Data-access/Sql/Entities/quiz-answer.typeorm-entity';
import { QuizStatisticTypeormEntity } from '../Data-access/Sql/Entities/quiz-statistic.typeorm-entity';

export class MapToViewQuizGame {
  static mapPair(pair: QuizPairTypeormEntity): QuizPairViewType {
    const mappedQuestions: QuizQuestionViewType[] = this.mapQuestions(
      pair.questions,
    );
    const firstPlayerAnswers: QuizAnswerTypeormEntity[] =
      pair.playersAnswers.filter((a) => a.userId === pair.firstPlayerId);
    const secondPlayerAnswers: QuizAnswerTypeormEntity[] =
      pair.playersAnswers.filter((a) => a.userId === pair.secondPlayerId);

    return {
      id: pair.id,
      firstPlayerProgress: {
        answers: this.mapAnswers(firstPlayerAnswers),
        player: {
          id: pair.firstPlayerId,
          login: pair.firstPlayer.login,
        },
        score: pair.firstPlayerScore,
      },
      secondPlayerProgress: pair.secondPlayerId
        ? {
            answers: this.mapAnswers(secondPlayerAnswers),
            player: {
              id: pair.secondPlayerId,
              login: pair.secondPlayer.login,
            },
            score: pair.secondPlayerScore,
          }
        : null,
      questions: pair.secondPlayerId ? mappedQuestions : null,
      status: pair.status,
      pairCreatedDate: pair.pairCreatedDate,
      startGameDate: pair.startGameDate,
      finishGameDate: pair.finishGameDate,
    };
  }

  static mapPairs(pairs: QuizPairTypeormEntity[]): QuizPairViewType[] {
    return pairs.map((pair) => {
      const mappedQuestions: QuizQuestionViewType[] = this.mapQuestions(
        pair.questions,
      );
      const firstPlayerAnswers: QuizAnswerTypeormEntity[] =
        pair.playersAnswers.filter((a) => a.userId === pair.firstPlayerId);
      const secondPlayerAnswers: QuizAnswerTypeormEntity[] =
        pair.playersAnswers.filter((a) => a.userId === pair.secondPlayerId);

      return {
        id: pair.id,
        firstPlayerProgress: {
          answers: this.mapAnswers(firstPlayerAnswers),
          player: {
            id: pair.firstPlayerId,
            login: pair.firstPlayer.login,
          },
          score: pair.firstPlayerScore,
        },
        secondPlayerProgress: pair.secondPlayerId
          ? {
              answers: this.mapAnswers(secondPlayerAnswers),
              player: {
                id: pair.secondPlayerId,
                login: pair.secondPlayer.login,
              },
              score: pair.secondPlayerScore,
            }
          : null,
        questions: pair.secondPlayerId ? mappedQuestions : null,
        status: pair.status,
        pairCreatedDate: pair.pairCreatedDate,
        startGameDate: pair.startGameDate,
        finishGameDate: pair.finishGameDate,
      };
    });
  }

  static mapAnswer(answer: QuizAnswerTypeormEntity): QuizAnswerViewType {
    return {
      questionId: answer.questionId,
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    };
  }

  static mapAnswers(progress: QuizAnswerTypeormEntity[]): QuizAnswerViewType[] {
    return progress.map((pr) => {
      return {
        questionId: pr.questionId,
        answerStatus: pr.answerStatus,
        addedAt: pr.addedAt,
      };
    });
  }

  static mapQuestionForSA(
    question: QuizQuestionTypeormEntity,
  ): QuizQuestionSAViewType {
    return {
      id: question.id,
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  static mapQuestionsForSA(
    questions: QuizQuestionTypeormEntity[],
  ): QuizQuestionSAViewType[] {
    return questions.map((question) => {
      return {
        id: question.id,
        body: question.body,
        correctAnswers: question.correctAnswers,
        published: question.published,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      };
    });
  }

  static mapQuestion(
    question: QuizQuestionTypeormEntity,
  ): QuizQuestionViewType {
    return {
      id: question.id,
      body: question.body,
    };
  }

  static mapQuestions(
    questions: QuizQuestionTypeormEntity[],
  ): QuizQuestionViewType[] {
    return questions.map((question) => {
      return {
        id: question.id,
        body: question.body,
      };
    });
  }

  static mapStatistic(
    statistic: QuizStatisticTypeormEntity | null,
  ): QuizStatisticViewType {
    return {
      sumScore: statistic ? statistic.sumScore : 0,
      avgScores: statistic ? statistic.avgScores : 0,
      gamesCount: statistic ? statistic.gamesCount : 0,
      winsCount: statistic ? statistic.winsCount : 0,
      lossesCount: statistic ? statistic.lossesCount : 0,
      drawsCount: statistic ? statistic.drawsCount : 0,
    };
  }

  static mapStatistics(
    statistics: QuizStatisticTypeormEntity[],
  ): QuizStatisticTop10ViewType[] {
    return statistics.map((statistic) => {
      return {
        sumScore: Number(statistic.sumScore),
        avgScores: Number(statistic.avgScores),
        gamesCount: Number(statistic.gamesCount),
        winsCount: Number(statistic.winsCount),
        lossesCount: Number(statistic.lossesCount),
        drawsCount: Number(statistic.drawsCount),
        player: {
          id: statistic.user.id,
          login: statistic.user.login,
        },
      };
    });
  }
}
