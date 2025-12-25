import { UpdateCommentLikeStatusDTO } from '../../../Api/InputDTOValidators/comment-input-dto.validator';
import { CommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';

import { CommentSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/comment-sql.repository';
import { LikeStatusSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/like-status-sql.repository';
import { Comment } from '../../../Domain/comment.entity';
import { LikeStatus } from '../../../Domain/likeStatus.entity';
import { AccessTokenPayloadType } from '../../../../Common/Types/auth-payloads.types';

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

    const newLikeStatus: LikeStatus = LikeStatus.createNew(
      dto.updateLikeStatusDTO.likeStatus,
      dto.user,
      dto.commentId,
    );
    await this.likeStatusRepository.updateLikeStatus(newLikeStatus);
    return true;
  }
}
