import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import format from 'pg-format';
import {
  BlogPagesType,
  BlogQueryType,
  BlogViewType,
  UserViewType,
} from '../../../Types/Types';
import { mapToView } from '../../../Core/helper';

@Injectable()
export class BlogSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findManyBlogs(sanitizedQuery: BlogQueryType): Promise<BlogPagesType> {
    const beforeQuery = format(
      `
           SELECT *
        FROM "blog" b
        WHERE b.name ILIKE $1 
        ORDER BY %I %s, id %s
        LIMIT $2
        OFFSET $3
    `,
      sanitizedQuery.sortBy,
      sanitizedQuery.sortDirection,
    );

    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;
    const result = await this.dataSource.query(beforeQuery, [
      sanitizedQuery.searchNameTerm,
      sanitizedQuery.pageSize,
      offsetValue,
    ]);

    const dbCount = await this.dataSource.query(
      `
        SELECT COUNT(*)
        FROM "blog"
        `,
    );
    const totalCount: number = Number(dbCount[0].count);
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
