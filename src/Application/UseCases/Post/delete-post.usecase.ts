import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../../Domain/post.entity';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { HttpStatus, Inject } from '@nestjs/common';
import { PostSqlRepository } from '../../../Infrastructure/Repositories/SQL/post-sql.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(PostSqlRepository) protected postRepository: PostSqlRepository,
  ) {}

  async execute(dto: DeletePostCommand): Promise<boolean> {
    const neededPost: Post | null = await this.postRepository.findById(
      dto.postId,
    );
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }

    return await this.postRepository.delete(dto.postId);
  }
}
