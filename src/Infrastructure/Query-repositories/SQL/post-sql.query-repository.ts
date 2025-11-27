import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AccessTokenPayloadType,
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
    user?: AccessTokenPayloadType,
  ): Promise<PostPagesType> {
    const sortBy: string = queryHelper.toSnake(sanitizedQuery.sortBy);
    const beforeQuery = format(
      `
      WITH post_with_likes AS (SELECT *
        FROM post p 
        LEFT JOIN LATERAL(
        SELECT *
        FROM like_status ls
        WHERE ls.entity_id = p.id AND ls.status = 'Like'
        ORDER BY added_at DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE p.blog_id = $1 OR $1 IS NOT DISTINCT FROM NULL
          ),
        agregated_likes AS (
        SELECT 
              pwl.id,
              jsonb_agg(
                  jsonb_build_object(
                  'login', pwl.user_login,
                  'userId', pwl.user_id,    
                  'addedAt', pwl.added_at,
                  )
              ) FILTER (WHERE pwl.added_at IS NOT NULL) as newest_likes
        FROM post_with_likes pwl
        GROUP BY pwl.id
        )
    SELECT 
        p.*,
        ls.status,
        al.newest_likes, 
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status
             WHERE entity_id = p.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status
             WHERE entity_id = p.id
         ),
        COUNT(*) OVER() AS total_count                   
    FROM post p
    LEFT JOIN agregated_likes al ON al.id = p.id
    LEFT JOIN like_status ls ON ls.entity_id = p.id AND ls.user_id IS NOT DISTINCT FROM $2
    WHERE p.blog_id = $1 OR $1 IS NOT DISTINCT FROM NULL    
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
      sanitizedQuery.blogId,
      user?.sub,
      sanitizedQuery.pageSize,
      offsetValue,
    ]);
    const totalCount: number = result[0] ? Number(result[0].total_count) : 0;
    const mappedPosts: PostViewType[] = mapToView.mapPosts(result);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedPosts,
    };
  }

  async findPostById(
    postId: string,
    user?: AccessTokenPayloadType,
  ): Promise<PostViewType | null> {
    const result = await this.dataSource.query(
      `
      WITH post_with_likes AS (SELECT *
        FROM post p 
        LEFT JOIN LATERAL(
        SELECT *
        FROM like_status ls
        WHERE ls.entity_id = p.id AND ls.status = 'Like'
        ORDER BY added_at DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE p.id = $1
          ),
        agregated_likes AS (
        SELECT 
              jsonb_agg(
                  jsonb_build_object(
                  'login', pwl.user_login,
                  'userId', pwl.user_id,    
                  'addedAt', pwl.added_at,
                  )
              ) FILTER (WHERE pwl.added_at IS NOT NULL) as newest_likes
        FROM post_with_likes pwl
        )
    SELECT 
        p.*,
        ls2.status,
        al.newest_likes, 
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status
             WHERE entity_id = p.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status
             WHERE entity_id = p.id
         )                 
    FROM post p
    LEFT JOIN agregated_likes al ON TRUE
    LEFT JOIN like_status ls2 ON ls2.entity_id = p.id AND ls2.user_id IS NOT DISTINCT FROM $2
    WHERE p.id = $1 
          `,
      [postId, user?.sub],
    );
    if (result.length === 0) {
      return null;
    }
    console.log(result);
    return mapToView.mapPost(result[0]);
  }
}
