import { Injectable } from '@nestjs/common';
import { SortDirection } from 'mongodb';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AccessTokenPayloadType,
  BlogQueryType,
  BlogViewType,
  PostPagesType,
  PostQueryType,
  PostViewType,
} from '../../../Types/Types';
import { mapToView, queryHelper } from '../../../Core/helper';
import format from 'pg-format';

@Injectable()
export class PostSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findManyPosts(
    sanitizedQuery: PostQueryType,
    // user?: AccessTokenPayloadType,
  ): Promise<PostPagesType> {
    const beforeQuery = format(
      `
           SELECT *
        FROM "post" p
        WHERE p.blog_id = $1 OR $1 IS NULL
        ORDER BY %I %s, id %s
        LIMIT $2
        OFFSET $3
    `,
      sanitizedQuery.sortBy,
      sanitizedQuery.sortDirection,
      sanitizedQuery.sortDirection,
    );

    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;
    const result = await this.dataSource.query(beforeQuery, [
      sanitizedQuery.blogId,
      sanitizedQuery.pageSize,
      offsetValue,
    ]);

    const dbCount = await this.dataSource.query(
      `
        SELECT COUNT(*)
        FROM "post"
        `,
    );
    const totalCount: number = Number(dbCount[0].count);
    const mappedUsers: PostViewType[] = mapToView.mapPosts(result);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }

  async findPostById(
    postId: string,
    // user?: AccessTokenPayloadType,
  ): Promise<PostViewType | null> {
    const result = await this.dataSource.query(
      `
          SELECT *
          FROM "post"
          WHERE id = $1
          `,
      [postId],
    );
    if (result.length === 0) {
      return null;
    }
    return mapToView.mapPost(result[0]);
  }
}
