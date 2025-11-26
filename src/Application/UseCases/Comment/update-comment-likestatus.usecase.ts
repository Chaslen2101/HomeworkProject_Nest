import { UpdateCommentLikeStatusDTO } from '../../../Api/Input-dto/comment.input-dto';
import { CommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

import { AccessTokenPayloadType } from '../../../Types/Types';
import { CommentSqlRepository } from '../../../Infrastructure/Repositories/SQL/comment-sql.repository';
import { LikeStatusSqlRepository } from '../../../Infrastructure/Repositories/SQL/like-status-sql.repository';
import { Comment } from '../../../Domain/comment.entity';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public updateLikeStatusDTO: UpdateCommentLikeStatusDTO,
    public user: AccessTokenPayloadType,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase {
  constructor(
    @Inject(CommentSqlRepository)
    protected commentRepository: CommentSqlRepository,
    @Inject(LikeStatusSqlRepository)
    protected likeStatusRepository: LikeStatusSqlRepository,
  ) {}

  async execute(dto: UpdateCommentLikeStatusCommand) {
    const neededComment: Comment | null = await this.commentRepository.findById(
      dto.commentId,
    );
    if (!neededComment) {
      throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
    }

    await this.likeStatusRepository.updateLikeStatus(
      dto.updateLikeStatusDTO.likeStatus,
      dto.user,
      dto.commentId,
    );
    return true;
  }
}
