import { CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BlogSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/blog-sql.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
  constructor(
    @Inject(BlogSqlRepository) private blogRepository: BlogSqlRepository,
  ) {}

  async execute(dto: DeleteBlogCommand): Promise<any> {
    return await this.blogRepository.delete(dto.blogId);
  }
}
