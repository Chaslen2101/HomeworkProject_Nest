import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../../Domain/post.entity';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';
import { Comment } from '../../../Domain/comment.entity';
import { CreateCommentForPostDTO } from '../../../Api/InputDTOValidators/post-input-dto.validator';
import { PostSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/post-sql.repository';
import { CommentSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/comment-sql.repository';
import { AccessTokenPayloadType } from '../../../../Common/Types/auth-payloads.types';

export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public createCommentForPostDTO: CreateCommentForPostDTO,
    public user: AccessTokenPayloadType,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase
  implements ICommandHandler<CreateCommentForPostCommand, string>
{
  constructor(
    @Inject(PostSqlRepository) protected postRepository: PostSqlRepository,
    @Inject(CommentSqlRepository)
    protected commentRepository: CommentSqlRepository,
  ) {}

  async execute(dto: CreateCommentForPostCommand): Promise<string> {
    const neededPost: Post | null = await this.postRepository.findById(
      dto.postId,
    );
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }

    const newComment: Comment = Comment.createNew(
      dto.createCommentForPostDTO,
      dto.user,
      dto.postId,
    );

    await this.commentRepository.createNew(newComment);

    return newComment.id;
  }
}
