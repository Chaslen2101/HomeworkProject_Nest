import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../../Domain/post.entity';
import { HttpStatus, Inject } from '@nestjs/common';
import { PostSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/post-sql.repository';
import { UpdatePostDTO } from '../../../Api/Input-dto/post.input-dto';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { BlogSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/blog-sql.repository';
import { Blog } from '../../../Domain/blog.entity';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public updatePostDTO: UpdatePostDTO,
    public blogId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(
    @Inject(PostSqlRepository) protected postRepository: PostSqlRepository,
    @Inject(BlogSqlRepository) protected blogRepository: BlogSqlRepository,
  ) {}

  async execute(dto: UpdatePostCommand): Promise<void> {
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
    neededPost.updatePost(dto.updatePostDTO);
    await this.postRepository.updatePost(neededPost);
    return;
  }
}
