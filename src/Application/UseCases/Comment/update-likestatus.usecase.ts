import { UpdateCommentLikeStatusDTO } from '../../../Api/Input-dto/comment.input-dto';
import { CommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { CommentRepository } from '../../../Infrastructure/Repositories/comment.repository';
import { CommentDocumentType } from '../../../Domain/comment.schema';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { UserPayloadDTO } from '../../../Api/Input-dto/auth.input-dto';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public updateLikeStatusDTO: UpdateCommentLikeStatusDTO,
    public user: UserPayloadDTO,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase {
  constructor(
    @Inject(CommentRepository) protected commentRepository: CommentRepository,
  ) {}

  async execute(dto: UpdateCommentLikeStatusCommand) {
    const neededComment: CommentDocumentType | null =
      await this.commentRepository.findById(dto.commentId);
    if (!neededComment) {
      throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
    }

    const isUpdated: boolean = neededComment.updateLikeStatus(
      dto.updateLikeStatusDTO.likeStatus,
      dto.user.sub,
    );
    if (!isUpdated) {
      throw new DomainException('Invalid like status', HttpStatus.FORBIDDEN);
    }

    await this.commentRepository.save(neededComment);
    return true;
  }
}
