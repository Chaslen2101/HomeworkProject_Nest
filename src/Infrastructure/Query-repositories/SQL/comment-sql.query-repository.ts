import { Injectable } from '@nestjs/common';
import { SortDirection } from 'mongodb';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AccessTokenPayloadType,
  CommentPagesType,
  CommentQueryType,
  CommentViewType,
  PostViewType,
} from '../../../Types/Types';
import { mapToView, queryHelper } from '../../../Core/helper';
import format from 'pg-format';

@Injectable()
export class CommentSqlQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findById(
    commentId: string,
    user?: AccessTokenPayloadType,
  ): Promise<CommentViewType | null> {
    const result = await this.dataSource.query(
      `
      WITH comment_with_likes AS (SELECT *
        FROM comment c 
        LEFT JOIN LATERAL(
        SELECT *
        FROM like_status ls
        WHERE ls.entity_id = c.id
        ORDER BY added_at DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE c.id = $1
          ),
        agregated_likes AS (
        SELECT 
              jsonb_agg(
                  jsonb_build_object(
                  'addedAt', cwl.added_at,
                  'userId', cwl.user_id,
                  'login', cwl.user_login
                  )
              ) FILTER (WHERE cwl.added_at IS NOT NULL) as newest_likes
        FROM comment_with_likes cwl
        )
    SELECT 
        c.*,
        ls.status,
        al.newest_likes, 
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status
             WHERE entity_id = c.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status
             WHERE entity_id = c.id
         ),
        COUNT(*) OVER() AS total_count                   
    FROM comment c
    LEFT JOIN agregated_likes al ON TRUE
    LEFT JOIN like_status ls ON ls.entity_id = c.id AND ls.user_id IS NOT DISTINCT FROM $2
    WHERE c.id = $1 
          `,
      [commentId, user?.sub],
    );
    if (result.length === 0) {
      return null;
    }
    return mapToView.mapComment(result[0]);
  }

  async findByPostId(
    postId: string,
    sanitizedQuery: CommentQueryType,
    user?: AccessTokenPayloadType,
  ): Promise<CommentPagesType> {
    const sortBy: string = queryHelper.toSnake(sanitizedQuery.sortBy);
    const beforeQuery = format(
      `
      WITH comment_with_likes AS (
          SELECT c.*, 
                newest_likes_table.user_id AS like_user_id, 
                newest_likes_table.user_login AS like_user_login, 
                newest_likes_table.status, 
                newest_likes_table.entity_id, 
                newest_likes_table.added_at 
        FROM comment c 
        LEFT JOIN LATERAL(
        SELECT *
        FROM like_status ls
        WHERE ls.entity_id = c.id
        ORDER BY added_at DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE c.post_id = $1
          ),
        agregated_likes AS (
        SELECT 
              cwl.id,
              jsonb_agg(
                  jsonb_build_object(
                  'addedAt', cwl.added_at,
                  'userId', cwl.user_id,
                  'login', cwl.user_login
                  )
              ) FILTER (WHERE cwl.added_at IS NOT NULL) as newest_likes
        FROM comment_with_likes cwl
        GROUP BY cwl.id
        )
    SELECT 
        c.*,
        ls.status,
        al.newest_likes, 
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status
             WHERE entity_id = c.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status
             WHERE entity_id = c.id
         ),
        COUNT(*) OVER() AS total_count                   
    FROM comment c
    LEFT JOIN agregated_likes al ON al.id = c.id
    LEFT JOIN like_status ls ON ls.entity_id = c.id AND ls.user_id IS NOT DISTINCT FROM $2
    WHERE c.post_id = $1    
        ORDER BY %I %s
        LIMIT $3
        OFFSET $4
    `,
      sortBy,
      sanitizedQuery.sortDirection,
    );

    const offsetValue: number =
      (sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize;

    const result = await this.dataSource.query(beforeQuery, [
      postId,
      user?.sub,
      sanitizedQuery.pageSize,
      offsetValue,
    ]);
    const totalCount: number = result[0] ? Number(result[0].count) : 0;
    const mappedComments: CommentViewType[] = mapToView.mapComments(result);
    return {
      pagesCount: Math.ceil(result[0].count / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedComments,
    };
  }
}
