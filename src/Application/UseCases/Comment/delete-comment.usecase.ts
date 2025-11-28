import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

import { AccessTokenPayloadType } from '../../../Domain/Types/Types';
import { CommentSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/comment-sql.repository';
import { PostSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/post-sql.repository';
import { Comment } from '../../../Domain/comment.entity';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public user: AccessTokenPayloadType,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, boolean>
{
  constructor(
    @Inject(CommentSqlRepository)
    private readonly commentRepository: CommentSqlRepository,
    @Inject(PostSqlRepository)
    private readonly postRepository: PostSqlRepository,
  ) {}

  async execute(dto: DeleteCommentCommand): Promise<boolean> {
    const neededComment: Comment | null = await this.commentRepository.findById(
      dto.commentId,
    );
    if (!neededComment) {
      throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
    }
    if (
      neededComment.commentatorInfo.userId.toString() !==
      dto.user.sub.toString()
    ) {
      throw new DomainException(
        'You cant delete not yours comment',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.commentRepository.deleteOne(dto.commentId);
  }
}
