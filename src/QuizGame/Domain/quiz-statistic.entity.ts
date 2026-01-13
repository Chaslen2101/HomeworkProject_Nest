import { QuizPair } from './quiz-pair.entity';

export class QuizStatistic {
  constructor(
    public userId: string,
    public sumScore: number,
    public avgScores: number,
    public gamesCount: number,
    public winsCount: number,
    public lossesCount: number,
    public drawsCount: number,
  ) {}

  static createNew(userId: string): QuizStatistic {
    return new this(userId, 0, 0, 0, 0, 0, 0);
  }

  updateStatistic(quizPair: QuizPair): void {
    const playerNumber: 1 | 2 = this.userId == quizPair.firstPlayerId ? 1 : 2;
    if (playerNumber == 1) {
      this.sumScore += quizPair.firstPlayerScore;
      if (quizPair.firstPlayerScore > quizPair.secondPlayerScore) {
        ++this.winsCount;
      } else if (quizPair.firstPlayerScore < quizPair.secondPlayerScore) {
        ++this.lossesCount;
      } else {
        ++this.drawsCount;
      }
    }

    if (playerNumber == 2) {
      this.sumScore += quizPair.secondPlayerScore;
      if (quizPair.secondPlayerScore > quizPair.firstPlayerScore) {
        ++this.winsCount;
      } else if (quizPair.secondPlayerScore < quizPair.firstPlayerScore) {
        ++this.lossesCount;
      } else {
        ++this.drawsCount;
      }
    }

    this.avgScores = this.gamesCount
      ? this.sumScore / this.gamesCount
      : this.sumScore;
    ++this.gamesCount;
    return;
  }
}
