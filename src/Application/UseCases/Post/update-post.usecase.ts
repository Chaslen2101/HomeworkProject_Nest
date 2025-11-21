import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../../Domain/post.entity';
import { HttpStatus, Inject } from '@nestjs/common';
import { PostSqlRepository } from '../../../Infrastructure/Repositories/SQL/post-sql.repository';
import { UpdatePostDTO } from '../../../Api/Input-dto/post.input-dto';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public updatePostDTO: UpdatePostDTO,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(
    @Inject(PostSqlRepository) protected postRepository: PostSqlRepository,
  ) {}

  async execute(dto: UpdatePostCommand): Promise<void> {
    const neededPost: Post | null = await this.postRepository.findById(
      dto.postId,
    );
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }
    neededPost.updatePost(dto.updatePostDTO);
    await this.postRepository.updatePost(neededPost);
    return;
  }
}
