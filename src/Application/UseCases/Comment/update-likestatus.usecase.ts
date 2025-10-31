import { UpdateCommentLikeStatusDTO } from '../../../Api/Input-dto/comment.input-dto';
import { ObjectId } from 'mongodb';
import { CommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { CommentRepository } from '../../../Infrastructure/Repositories/comment.repository';
import { CommentDocumentType } from '../../../Domain/comment.schema';
import { Types } from 'mongoose';
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
    const commentId: ObjectId = new Types.ObjectId(dto.commentId);
    const neededComment: CommentDocumentType | null =
      await this.commentRepository.findById(commentId);
    if (!neededComment) {
      throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
    }

    const isUpdated: boolean = neededComment.updateLikeStatus(
      dto.updateLikeStatusDTO.likeStatus,
      dto.user.sub,
    );
    if (!isUpdated) {
      throw new Error('Invalid like status');
    }

    await this.commentRepository.save(neededComment);
    return true;
  }
}
