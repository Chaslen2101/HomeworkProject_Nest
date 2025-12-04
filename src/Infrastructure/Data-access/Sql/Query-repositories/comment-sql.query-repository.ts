import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AccessTokenPayloadType,
  CommentPagesType,
  CommentQueryType,
  CommentViewType,
} from '../../../../Domain/Types/Types';
import { queryHelper } from '../../../Utils/helper';
import format from 'pg-format';
import { mapToView } from '../../../Mapper/view-model.mapper';
import { CommentTypeormEntity } from '../Entities/comment-typeorm.entity';

@Injectable()
export class CommentSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(CommentTypeormEntity)
    protected commentRepository: Repository<CommentTypeormEntity>,
  ) {}

  async findById(
    commentId: string,
    user?: AccessTokenPayloadType,
  ): Promise<CommentViewType | null> {
    const result = await this.dataSource.query(
      `
      WITH comment_with_likes AS (SELECT *
        FROM comment_typeorm_entity c
        LEFT JOIN LATERAL(
        SELECT ls."userId" AS like_user_id,
                ls."userLogin" AS like_user_login,
                ls.status,
                ls."entityId",
                ls."addedAt"
        FROM like_status_typeorm_entity ls
        WHERE ls."entityId" = c.id AND ls.status = 'Like'
        ORDER BY "addedAt" DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE c.id = $1
          ),
        agregated_likes AS (
        SELECT
              json_agg(
                  json_build_object(
                  'addedAt', cwl."addedAt",
                  'userId', cwl.like_user_id,
                  'login', cwl.like_user_login
                  )
                  ORDER BY cwl."addedAt" DESC
              ) FILTER (WHERE cwl."addedAt" IS NOT NULL) as newest_likes
        FROM comment_with_likes cwl
        )
    SELECT
        c.*,
        ls.status,
        al.newest_likes,
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = c.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = c.id
         )
    FROM comment_typeorm_entity c
    LEFT JOIN agregated_likes al ON TRUE
    LEFT JOIN like_status_typeorm_entity ls ON ls."entityId" = c.id AND ls."userId" IS NOT DISTINCT FROM $2
    WHERE c.id = $1
          `,
      [commentId, user?.sub],
    );

    if (result.length === 0) {
      return null;
    }
    return mapToView.mapComment(result);
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
          SELECT *
        FROM comment_typeorm_entity c
        LEFT JOIN LATERAL(
        SELECT  ls."userId" AS like_user_id,
                ls."userLogin" AS like_user_login,
                ls.status,
                ls."entityId",
                ls."addedAt"
        FROM like_status_typeorm_entity ls
        WHERE ls."entityId" = c.id AND ls.status = 'Like'
        ORDER BY "addedAt" DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE c."postId" = $1
          ),
        agregated_likes AS (
        SELECT
              cwl.id,
              json_agg(
                  json_build_object(
                  'addedAt', cwl."addedAt",
                  'userId', cwl.like_user_id,
                  'login', cwl.like_user_login
                  )
                  ORDER BY cwl."addedAt" DESC
              ) FILTER (WHERE cwl."addedAt" IS NOT NULL) as newest_likes
        FROM comment_with_likes cwl
        GROUP BY cwl.id
        )
    SELECT
        c.*,
        ls.status,
        al.newest_likes,
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = c.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = c.id
         ),
        COUNT(*) OVER() AS total_count
    FROM comment_typeorm_entity c
    LEFT JOIN agregated_likes al ON al.id = c.id
    LEFT JOIN like_status_typeorm_entity ls ON ls."entityId" = c.id AND ls."userId" IS NOT DISTINCT FROM $2
    WHERE c."postId" = $1
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
    const totalCount: number = result[0] ? Number(result[0].total_count) : 0;
    const mappedComments: CommentViewType[] = mapToView.mapComments(result);
    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedComments,
    };
  }
}
