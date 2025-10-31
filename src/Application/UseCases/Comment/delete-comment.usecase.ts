import { CommentRepository } from '../../../Infrastructure/Repositories/comment.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentDocumentType } from '../../../Domain/comment.schema';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { ObjectId } from 'mongodb';
import { PostDocumentType } from '../../../Domain/post.schema';
import { PostRepository } from '../../../Infrastructure/Repositories/post.repository';
import { Types } from 'mongoose';
import { JwtPayloadDTO } from '../../../Api/Input-dto/auth.input-dto';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public user: JwtPayloadDTO,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentCommandUseCase
  implements ICommandHandler<DeleteCommentCommand, boolean>
{
  constructor(
    @Inject(CommentRepository)
    private readonly commentRepository: CommentRepository,
    @Inject(PostRepository) private readonly postRepository: PostRepository,
  ) {}

  async execute(dto: DeleteCommentCommand): Promise<boolean> {
    const commentId: ObjectId = new Types.ObjectId(dto.commentId);
    const neededComment: CommentDocumentType | null =
      await this.commentRepository.findById(commentId);
    if (!neededComment) {
      throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
    }
    if (neededComment.commentatorInfo.userId !== dto.user.sub) {
      throw new DomainException(
        'You cant delete not yours comment',
        HttpStatus.FORBIDDEN,
      );
    }

    const neededPost: PostDocumentType | null =
      await this.postRepository.findById(neededComment.postId);
    if (!neededPost) {
      throw new DomainException('Cant find needed post', HttpStatus.NOT_FOUND);
    }
    neededPost.deleteComment(commentId);
    await this.postRepository.save(neededPost);
    await this.commentRepository.deleteComment(commentId);
    return true;
  }
}
