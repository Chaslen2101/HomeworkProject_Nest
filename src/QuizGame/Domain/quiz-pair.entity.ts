import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';
import { randomUUID } from 'node:crypto';
import { PairStatusEnum } from './Types/pair-status.enum';
import { QuizAnswer } from './quiz-answer.entity';
import { AnswerStatusEnum } from './Types/answer-status.enum';

export class QuizPair {
  constructor(
    public id: string,
    public firstPlayerId: string,
    public secondPlayerId: string | null,
    public status: PairStatusEnum,
    public pairCreatedDate: Date,
    public startGameDate: Date | null,
    public finishGameDate: Date | null,
    public firstPlayerScore: number,
    public secondPlayerScore: number,
  ) {}

  static createNew(userInfo: AccessTokenPayloadType): QuizPair {
    return new this(
      randomUUID(),
      userInfo.sub,
      null,
      PairStatusEnum.Pending,
      new Date(),
      null,
      null,
      0,
      0,
    );
  }

  addSecondPlayer(userInfo: AccessTokenPayloadType): QuizPair {
    this.secondPlayerId = userInfo.sub;
    this.status = PairStatusEnum.Active;
    this.startGameDate = new Date();
    return this;
  }

  tryFinishGame(answers: QuizAnswer[]): QuizPair | void {
    const canFinish: boolean = this.canFinish(answers);
    if (!canFinish) {
      return;
    }
    this.status = PairStatusEnum.Finished;
    this.finishGameDate = new Date();
  }

  private canFinish(answers: QuizAnswer[]): boolean {
    return answers.length == 10;
  }

  countScore(answers: QuizAnswer[]): void {
    const firstPlayerAnswers: QuizAnswer[] = answers.filter(
      (a) => a.userId == this.firstPlayerId,
    );
    const firstPlayerCorrectAnswers: QuizAnswer[] = firstPlayerAnswers.filter(
      (a) => a.answerStatus === AnswerStatusEnum.Correct,
    );
    let firstPlayerScore: number = firstPlayerCorrectAnswers.length;

    const secondPlayerAnswers: QuizAnswer[] = answers.filter(
      (a) => a.userId == this.secondPlayerId,
    );
    const secondPlayerCorrectAnswers: QuizAnswer[] = secondPlayerAnswers.filter(
      (a) => a.answerStatus === AnswerStatusEnum.Correct,
    );
    let secondPlayerScore: number = secondPlayerCorrectAnswers.length;

    if (this.canFinish(answers)) {
      const firstPlayerFinishDate: number = Math.max(
        ...firstPlayerAnswers.map((a) => a.addedAt.getTime()),
      );
      const secondPlayerFinishDate: number = Math.max(
        ...secondPlayerAnswers.map((a) => a.addedAt.getTime()),
      );
      if (
        firstPlayerFinishDate < secondPlayerFinishDate &&
        firstPlayerScore > 0
      ) {
        ++firstPlayerScore;
      }
      if (firstPlayerFinishDate > secondPlayerScore && secondPlayerScore > 0) {
        ++secondPlayerScore;
      }
    }
    this.firstPlayerScore = firstPlayerScore;
    this.secondPlayerScore = secondPlayerScore;
    return;
  }
}
