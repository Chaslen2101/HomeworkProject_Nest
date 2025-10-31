import { CommandHandler } from '@nestjs/cqrs';
import { PostDocumentType } from '../../../Domain/post.schema';
import { PostRepository } from '../../../Infrastructure/Repositories/post.repository';
import { HttpStatus, Inject } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { Comment, CommentDocumentType } from '../../../Domain/comment.schema';
import type { CommentModelType } from '../../../Domain/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserPayloadDTO } from '../../../Api/Input-dto/auth.input-dto';
import { CreateCommentForPostDTO } from '../../../Api/Input-dto/post.input-dto';
import { CommentRepository } from '../../../Infrastructure/Repositories/comment.repository';

export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public createCommentForPostDTO: CreateCommentForPostDTO,
    public user: UserPayloadDTO,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase {
  constructor(
    @Inject(PostRepository) protected postRepository: PostRepository,
    @InjectModel(Comment.name) protected commentModel: CommentModelType,
    @Inject(CommentRepository) protected commentRepository: CommentRepository,
  ) {}

  async execute(dto: CreateCommentForPostCommand): Promise<string> {
    const postId: ObjectId = new Types.ObjectId(dto.postId);

    const neededPost: PostDocumentType | null =
      await this.postRepository.findById(postId);
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }

    const newComment: CommentDocumentType = neededPost.createComment(
      dto.createCommentForPostDTO.content,
      dto.user,
      this.commentModel,
    );

    await this.commentRepository.save(newComment);
    await this.postRepository.save(neededPost);
    return newComment._id.toString();
  }
}
