import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';
import { randomUUID } from 'node:crypto';

export class QuizPair {
  constructor(
    public id: string,
    public firstPlayerId: string,
    public secondPlayerId: string | null,
    public status: string,
    public pairCreatedDate: Date,
    public startGameDate: Date | null,
    public finishGameDate: Date | null,
  ) {}

  static createNew(userInfo: AccessTokenPayloadType): QuizPair {
    return new this(
      randomUUID(),
      userInfo.sub,
      null,
      'PendingSecondPlayer',
      new Date(),
      null,
      null,
    );
  }

  addSecondPlayer(userInfo: AccessTokenPayloadType): QuizPair {
    this.secondPlayerId = userInfo.sub;
    this.status = 'Active';
    this.startGameDate = new Date();
    return this;
  }
}
