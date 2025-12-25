import { AnswerStatusEnum } from './Types/answer.types';
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
    if (gameData.answers.length === 5) {
      throw new DomainException('User already answered all questions', 403);
    }
    const questionToAnswer: QuizQuestion =
      gameData.questions[gameData.answers.length];
    let status: AnswerStatusEnum;
    if (questionToAnswer.answers.includes(answer)) {
      status = AnswerStatusEnum.Correct;
    } else {
      status = AnswerStatusEnum.Incorrect;
    }
    return new this(
      randomUUID(),
      userId,
      gameData.pairId,
      questionToAnswer.id,
      answer,
      status,
      new Date(),
    );
  }
}
