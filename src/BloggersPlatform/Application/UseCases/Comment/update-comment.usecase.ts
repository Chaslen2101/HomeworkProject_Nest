import { CreateUpdateCommentInputDTO } from '../../../Api/InputDTOValidators/comment-input-dto.validator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';

import { CommentSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/comment-sql.repository';
import { Comment } from '../../../Domain/comment.entity';
import { AccessTokenPayloadType } from '../../../../Common/Types/auth-payloads.types';

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
