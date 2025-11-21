import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUpdateBlogInputDTO } from '../../../Api/Input-dto/blog.input-dto';
import { Blog } from '../../../Domain/blog.entity';
import { Inject } from '@nestjs/common';
import { BlogSqlRepository } from '../../../Infrastructure/Repositories/SQL/blog-sql.repository';

export class CreateBlogCommand {
  constructor(public createBlogDTO: CreateUpdateBlogInputDTO) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @Inject(BlogSqlRepository) protected blogRepository: BlogSqlRepository,
  ) {}

  async execute(dto: CreateBlogCommand): Promise<any> {
    const newBlog: Blog = Blog.createNew(dto.createBlogDTO);
    await this.blogRepository.createNewBlog(newBlog);
    return newBlog.id;
  }
}
