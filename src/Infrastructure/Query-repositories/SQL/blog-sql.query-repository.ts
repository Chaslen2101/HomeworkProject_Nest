import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import format from 'pg-format';
import {
  BlogPagesType,
  BlogQueryType,
  BlogViewType,
} from '../../../Types/Types';
import { mapToView, queryHelper } from '../../../Core/helper';

@Injectable()
export class BlogSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findManyBlogs(sanitizedQuery: BlogQueryType): Promise<BlogPagesType> {
    const sortBy: string = queryHelper.toSnake(sanitizedQuery.sortBy);
    const beforeQuery = format(
      `
           SELECT b.*, COUNT(*) OVER() AS count
        FROM "blog" b
        WHERE b.name ILIKE '%' || $1 || '%'
        ORDER BY %I %s
        LIMIT $2
        OFFSET $3
    `,
      sortBy,
      sanitizedQuery.sortDirection,
    );

    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;
    const result = await this.dataSource.query(beforeQuery, [
      sanitizedQuery.searchNameTerm,
      sanitizedQuery.pageSize,
      offsetValue,
    ]);
    const totalCount: number = result[0] ? Number(result[0].count) : 0;
    const mappedUsers: BlogViewType[] = mapToView.mapBlogs(result);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }

  async findBlogByID(blogId: string): Promise<BlogViewType | null> {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM "blog" b
        WHERE b.id = $1
        `,
      [blogId],
    );
    if (result.length === 0) {
      return null;
    }
    return mapToView.mapBlog(result[0]);
  }
}
