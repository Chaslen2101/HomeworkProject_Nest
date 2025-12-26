import { AnswerStatusEnum } from './Types/answer-status.enum';
import { DomainException } from '../../Common/Domain/Exceptions/domain-exceptions';
import { GameDataType } from './Types/game-data.types';
import { QuizQuestion } from './quiz-question.entity';
import { randomUUID } from 'node:crypto';

export class QuizAnswer {
  constructor(
    public id: string,
    public userId: string,
    public pairId: string,
    public questionId: string,
    public answer: string,
    public answerStatus: AnswerStatusEnum,
    public addedAt: Date,
  ) {}

  static createNew(
    gameData: GameDataType,
    answer: string,
    userId: string,
  ): QuizAnswer {
    const userAnswers: QuizAnswer[] = gameData.answers.filter(
      (a) => a.userId === userId,
    );
    if (userAnswers.length == 5) {
      throw new DomainException('User already answered all questions', 403);
    }
    const questionToAnswer: QuizQuestion =
      gameData.questions[userAnswers.length];
    let status: AnswerStatusEnum;
    if (questionToAnswer.correctAnswers.includes(answer)) {
      status = AnswerStatusEnum.Correct;
    } else {
      status = AnswerStatusEnum.Incorrect;
    }
    return new this(
      randomUUID(),
      userId,
      gameData.pair.id,
      questionToAnswer.id,
      answer,
      status,
      new Date(),
    );
  }
}
