import { CreateUpdateCommentInputDTO } from '../../../Api/Input-dto/comment.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

import { AccessTokenPayloadType } from '../../../Domain/Types/Types';
import { CommentSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/comment-sql.repository';
import { Comment } from '../../../Domain/comment.entity';

export class UpdateCommentCommand {
  constructor(
    public updateCommentData: CreateUpdateCommentInputDTO,
    public commentId: string,
    public user: AccessTokenPayloadType,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, boolean>
{
  constructor(
    @Inject(CommentSqlRepository)
    protected commentRepository: CommentSqlRepository,
  ) {}
  async execute(dto: UpdateCommentCommand) {
    const neededComment: Comment | null = await this.commentRepository.findById(
      dto.commentId,
    );
    if (!neededComment) {
      throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
    }
    neededComment.updateCommentContent(
      dto.updateCommentData.content,
      dto.user.sub,
    );
    await this.commentRepository.update(neededComment);

    return true;
  }
}
