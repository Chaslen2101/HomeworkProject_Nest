import { DomainException } from './Exceptions/domain-exceptions';
import { CreateCommentForPostDTO } from '../Api/Input-dto/post.input-dto';
import { AccessTokenPayloadType } from '../Types/Types';
import { randomUUID } from 'node:crypto';

export class Comment {
  constructor(
    public id: string,

    public content: string,

    public commentatorInfo: {
      userId: string;

      userLogin: string;
    },

    public createdAt: Date,

    public postId: string,
  ) {}

  static createNew(
    dto: CreateCommentForPostDTO,
    user: AccessTokenPayloadType,
    postId: string,
  ): Comment {
    return new this(
      randomUUID(),
      dto.content,
      { userId: user.sub, userLogin: user.login },
      new Date(),
      postId,
    );
  }

  updateCommentContent(content: string, userId: string) {
    if (userId !== this.commentatorInfo.userId) {
      throw new DomainException('You cannot update not yours comment', 403);
    }
    this.content = content;
    return true;
  }
}
