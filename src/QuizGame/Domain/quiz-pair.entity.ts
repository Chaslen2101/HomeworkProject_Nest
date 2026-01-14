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
    public canFinishEarlier: boolean = false,
    public whenCanFinishEarlier: Date | null = null,
    public answeredFirst: string | null = null,
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

  tryToFinishGame(answers: QuizAnswer[]): boolean {
    const canFinish: boolean = this.canFinish(answers);
    if (!canFinish) {
      return false;
    }
    this.countScoreWhenFinish(answers);
    this.status = PairStatusEnum.Finished;
    this.finishGameDate = new Date();
    return true;
  }

  tryToStartFinishTimer(answers: QuizAnswer[], userId: string): void {
    const extractedAnswers: ExtractedAnswers =
      this.extractAllAnswersOfPlayers(answers);
    if (
      (extractedAnswers.firstPlayerAnswers.length == 5 ||
        extractedAnswers.secondPlayerAnswers.length == 5) &&
      answers.length != 10 &&
      !this.canFinishEarlier
    ) {
      this.canFinishEarlier = true;
      const secondsToFinish = 7;
      const date: Date = new Date();
      date.setSeconds(date.getSeconds() + secondsToFinish);
      this.whenCanFinishEarlier = date;
      this.answeredFirst = userId;
    }
    return;
  }

  finishEarlier(): void {
    this.status = PairStatusEnum.Finished;
    this.finishGameDate = new Date();
    if (this.firstPlayerId == this.answeredFirst) {
      ++this.firstPlayerScore;
    }
    if (this.secondPlayerId == this.answeredFirst) {
      ++this.secondPlayerScore;
    }
  }

  private canFinish(answers: QuizAnswer[]): boolean {
    return answers.length == 10;
  }

  countScore(answers: QuizAnswer[]): void {
    const playersAnswers: ExtractedAnswers =
      this.extractAllAnswersOfPlayers(answers);
    const correctPlayersAnswers: ExtractedAnswers =
      this.extractCorrectAnswersOfPlayers(playersAnswers);

    const firstPlayerScore: number =
      correctPlayersAnswers.firstPlayerAnswers.length;

    const secondPlayerScore: number =
      correctPlayersAnswers.secondPlayerAnswers.length;

    this.firstPlayerScore = firstPlayerScore;
    this.secondPlayerScore = secondPlayerScore;
    return;
  }

  private countScoreWhenFinish(answers: QuizAnswer[]): void {
    const playersAnswers: ExtractedAnswers =
      this.extractAllAnswersOfPlayers(answers);

    const firstPlayerFinishDate: number = Math.max(
      ...playersAnswers.firstPlayerAnswers.map((a) => a.addedAt.getTime()),
    );
    const secondPlayerFinishDate: number = Math.max(
      ...playersAnswers.secondPlayerAnswers.map((a) => a.addedAt.getTime()),
    );

    if (
      firstPlayerFinishDate < secondPlayerFinishDate &&
      this.firstPlayerScore > 0
    ) {
      ++this.firstPlayerScore;
    } else if (
      secondPlayerFinishDate < firstPlayerFinishDate &&
      this.secondPlayerScore > 0
    ) {
      ++this.secondPlayerScore;
    }
  }

  private extractAllAnswersOfPlayers(answers: QuizAnswer[]): ExtractedAnswers {
    const firstPlayerAnswers: QuizAnswer[] = answers.filter(
      (a) => a.userId == this.firstPlayerId,
    );
    const secondPlayerAnswers: QuizAnswer[] = answers.filter(
      (a) => a.userId == this.secondPlayerId,
    );
    return {
      firstPlayerAnswers: firstPlayerAnswers,
      secondPlayerAnswers: secondPlayerAnswers,
    };
  }

  private extractCorrectAnswersOfPlayers(
    playersAnswers: ExtractedAnswers,
  ): ExtractedAnswers {
    const firstPlayerAnswers: QuizAnswer[] =
      playersAnswers.firstPlayerAnswers.filter(
        (a) => a.answerStatus === AnswerStatusEnum.Correct,
      );
    const secondPlayerAnswers: QuizAnswer[] =
      playersAnswers.secondPlayerAnswers.filter(
        (a) => a.answerStatus === AnswerStatusEnum.Correct,
      );
    return {
      firstPlayerAnswers: firstPlayerAnswers,
      secondPlayerAnswers: secondPlayerAnswers,
    };
  }
}

type ExtractedAnswers = {
  firstPlayerAnswers: QuizAnswer[];
  secondPlayerAnswers: QuizAnswer[];
};
