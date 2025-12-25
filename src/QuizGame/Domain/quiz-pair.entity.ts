import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';
import { randomUUID } from 'node:crypto';
import { PairStatusEnum } from './Types/pair-status.enum';

export class QuizPair {
  constructor(
    public id: string,
    public firstPlayerId: string,
    public secondPlayerId: string | null,
    public status: PairStatusEnum,
    public pairCreatedDate: Date,
    public startGameDate: Date | null,
    public finishGameDate: Date | null,
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
    );
  }

  addSecondPlayer(userInfo: AccessTokenPayloadType): QuizPair {
    this.secondPlayerId = userInfo.sub;
    this.status = PairStatusEnum.Active;
    this.startGameDate = new Date();
    return this;
  }
}
