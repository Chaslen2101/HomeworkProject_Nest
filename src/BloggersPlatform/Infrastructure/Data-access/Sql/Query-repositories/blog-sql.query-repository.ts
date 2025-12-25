import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { BlogTypeormEntity } from '../Entities/blog.typeorm-entity';
import { MapToViewBloggerPlatform } from '../../../Mappers/blogger-platform-view-model.mapper';
import { BlogQueryType } from '../../../../Api/Types/bloggers-platform.input-query.types';
import {
  BlogPagesType,
  BlogViewType,
} from '../../../../Api/Types/bloggers-platform.view-model.types';

@Injectable()
export class BlogSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(BlogTypeormEntity)
    protected blogRepository: Repository<BlogTypeormEntity>,
  ) {}
  async findManyBlogs(sanitizedQuery: BlogQueryType): Promise<BlogPagesType> {
    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;
    const [items, totalCount] = await this.blogRepository.findAndCount({
      where: {
        name: sanitizedQuery.searchNameTerm
          ? ILike(`%${sanitizedQuery.searchNameTerm}%`)
          : undefined,
      },
      order: { [sanitizedQuery.sortBy]: sanitizedQuery.sortDirection },
      take: sanitizedQuery.pageSize,
      skip: offsetValue,
    });
    const mappedUsers: BlogViewType[] =
      MapToViewBloggerPlatform.mapBlogs(items);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }

  async findBlogByID(blogId: string): Promise<BlogViewType | null> {
    const result: BlogTypeormEntity | null =
      await this.blogRepository.findOneBy({ id: blogId });
    if (!result) {
      return null;
    }
    return MapToViewBloggerPlatform.mapBlog(result);
  }
}
