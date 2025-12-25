import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUpdateBlogInputDTO } from '../../../Api/InputDTOValidators/blog-input-dto.validator';
import { Blog } from '../../../Domain/blog.entity';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';
import { HttpStatus, Inject } from '@nestjs/common';
import { BlogSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/blog-sql.repository';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public updateBlogDTO: CreateUpdateBlogInputDTO,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    @Inject(BlogSqlRepository) protected blogRepository: BlogSqlRepository,
  ) {}

  async execute(dto: UpdateBlogCommand): Promise<any> {
    const neededBlog: Blog | null = await this.blogRepository.findById(
      dto.blogId,
    );
    if (!neededBlog) {
      throw new DomainException('Blog not found', HttpStatus.NOT_FOUND);
    }
    neededBlog.updateBlogData(dto.updateBlogDTO);
    await this.blogRepository.updateBlog(neededBlog);
    return true;
  }
}
