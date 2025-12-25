import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUpdateBlogInputDTO } from '../../../Api/InputDTOValidators/blog-input-dto.validator';
import { Blog } from '../../../Domain/blog.entity';
import { Inject } from '@nestjs/common';
import { BlogSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/blog-sql.repository';

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
