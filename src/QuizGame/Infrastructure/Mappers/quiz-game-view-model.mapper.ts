import {
  QuizQuestionViewType,
  QuizPairViewType,
  QuizAnswerViewType,
} from '../../Api/Types/quiz-game-view-model.types';
import { QuizQuestionTypeormEntity } from '../Data-access/Sql/Entities/quiz-question-typeorm.entity';
import { QuizPairTypeormEntity } from '../Data-access/Sql/Entities/quiz-pair-typeorm.entity';
import { QuizAnswerTypeormEntity } from '../Data-access/Sql/Entities/quiz-answer-typeorm.entity';
import { AnswerStatusEnum } from '../../Domain/Types/answer.types';

export class MapToViewQuizGame {
  static mapPair(pair: QuizPairTypeormEntity): QuizPairViewType {
    const mappedQuestions: QuizQuestionViewType[] = this.mapQuestions(
      pair.questions,
    );
    const firstPlayerAnswers: QuizAnswerTypeormEntity[] =
      pair.playersAnswers.filter((a) => a.userId === pair.firstPlayerId);
    const secondPlayerAnswers: QuizAnswerTypeormEntity[] =
      pair.playersAnswers.filter((a) => a.userId === pair.secondPlayerId);

    const firstPlayerCorrectAnswers: QuizAnswerTypeormEntity[] =
      firstPlayerAnswers.filter(
        (a) => a.answerStatus === AnswerStatusEnum.Correct,
      );
    const firstPlayerScore: number = firstPlayerCorrectAnswers.length;

    const secondPlayerCorrectAnswers: QuizAnswerTypeormEntity[] =
      firstPlayerAnswers.filter(
        (a) => a.answerStatus === AnswerStatusEnum.Correct,
      );
    const secondPlayerScore: number = secondPlayerCorrectAnswers.length;

    return {
      id: pair.id,
      firstPlayerProgress: {
        answers: this.mapAnswers(firstPlayerAnswers),
        player: {
          id: pair.firstPlayerId,
          login: pair.firstPlayer.login,
        },
        score: firstPlayerScore,
      },
      secondPlayerProgress: pair.secondPlayerId
        ? {
            answers: this.mapAnswers(secondPlayerAnswers),
            player: {
              id: pair.secondPlayerId,
              login: pair.secondPlayer.login,
            },
            score: secondPlayerScore,
          }
        : null,
      questions: pair.secondPlayerId ? mappedQuestions : null,
      status: pair.status,
      pairCreatedDate: pair.pairCreatedDate,
      startGameDate: pair.startGameDate,
      finishGameDate: pair.finishGameDate,
    };
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

  static mapQuestion(
    question: QuizQuestionTypeormEntity,
  ): QuizQuestionViewType {
    return {
      id: question.id,
      body: question.body,
      correctAnswers: question.answers,
      published: question.published,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  static mapQuestions(
    questions: QuizQuestionTypeormEntity[],
  ): QuizQuestionViewType[] {
    return questions.map((question) => {
      return {
        id: question.id,
        body: question.body,
        correctAnswers: question.answers,
        published: question.published,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      };
    });
  }
}
