import { CreateUpdateCommentInputDTO } from '../../../Api/Input-dto/comment.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocumentType } from '../../../Domain/comment.schema';
import { CommentRepository } from '../../../Infrastructure/Repositories/comment.repository';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { UserPayloadDTO } from '../../../Api/Input-dto/auth.input-dto';

export class UpdateCommentCommand {
  constructor(
    public updateCommentData: CreateUpdateCommentInputDTO,
    public commentId: string,
    public user: UserPayloadDTO,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, boolean>
{
  constructor(
    @Inject(CommentRepository) protected commentRepository: CommentRepository,
  ) {}
  async execute(dto: UpdateCommentCommand) {
    const neededComment: CommentDocumentType | null =
      await this.commentRepository.findById(dto.commentId);
    if (!neededComment) {
      throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (
      neededComment.commentatorInfo.userId.toString() !==
      dto.user.sub.toString()
    ) {
      throw new DomainException(
        'You cant update not yours comment',
        HttpStatus.FORBIDDEN,
      );
    }

    neededComment.updateCommentContent(
      dto.updateCommentData.content,
      dto.user.sub,
    );
    await this.commentRepository.save(neededComment);

    return true;
  }
}
