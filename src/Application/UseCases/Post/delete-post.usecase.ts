import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../../Domain/post.entity';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { HttpStatus, Inject } from '@nestjs/common';
import { PostSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/post-sql.repository';
import { Blog } from '../../../Domain/blog.entity';
import { BlogSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/blog-sql.repository';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(PostSqlRepository) protected postRepository: PostSqlRepository,
    @Inject(BlogSqlRepository) protected blogRepository: BlogSqlRepository,
  ) {}

  async execute(dto: DeletePostCommand): Promise<boolean> {
    const neededBlog: Blog | null = await this.blogRepository.findById(
      dto.blogId,
    );
    if (!neededBlog) {
      throw new DomainException('Blog not found', HttpStatus.NOT_FOUND);
    }

    const neededPost: Post | null = await this.postRepository.findById(
      dto.postId,
    );
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }

    return await this.postRepository.delete(dto.postId);
  }
}
