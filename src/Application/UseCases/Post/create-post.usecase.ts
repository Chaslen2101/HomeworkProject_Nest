import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostForBlogInputDTO } from '../../../Api/Input-dto/blog.input-dto';
import { Blog } from '../../../Domain/blog.entity';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { HttpStatus, Inject } from '@nestjs/common';
import { Post } from '../../../Domain/post.entity';
import { BlogSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/blog-sql.repository';
import { PostSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/post-sql.repository';

export class CreatePostCommand {
  constructor(
    public createPostDTO: CreatePostForBlogInputDTO,
    public blogId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(BlogSqlRepository) protected blogRepository: BlogSqlRepository,
    @Inject(PostSqlRepository) protected postRepository: PostSqlRepository,
  ) {}

  async execute(dto: CreatePostCommand): Promise<any> {
    const neededBlog: Blog | null = await this.blogRepository.findById(
      dto.blogId,
    );

    if (!neededBlog) {
      throw new DomainException('Blog not found', HttpStatus.NOT_FOUND);
    }

    const newPost: Post = Post.createNew(
      dto.createPostDTO,
      neededBlog.id,
      neededBlog.name,
    );
    await this.postRepository.createNewPost(newPost);
    return newPost.id;
  }
}
