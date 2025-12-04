import { AccessTokenPayloadType } from './Types/Types';

export class LikeStatus {
  constructor(
    public userId: string,
    public userLogin: string,
    public status: string,
    public entityId: string,
    public addedAt: Date,
  ) {}

  static createNew(
    likeStatus: string,
    userInfo: AccessTokenPayloadType,
    entityId: string,
  ): LikeStatus {
    return new this(
      userInfo.sub,
      userInfo.login,
      likeStatus,
      entityId,
      new Date(),
    );
  }
}
