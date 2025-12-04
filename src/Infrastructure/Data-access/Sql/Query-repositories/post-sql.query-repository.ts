import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AccessTokenPayloadType,
  PostPagesType,
  PostQueryType,
  PostViewType,
} from '../../../../Domain/Types/Types';
import { mapToView } from '../../../Mapper/view-model.mapper';
import { PostTypeormEntity } from '../Entities/post-typeorm.entity';
import { LikeStatusTypeormEntity } from '../Entities/likeStatus-typeorm.entity';
import { queryHelper } from '../../../Utils/helper';
import format from 'pg-format';

@Injectable()
export class PostSqlQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PostTypeormEntity)
    protected postRepository: Repository<PostTypeormEntity>,
    @InjectRepository(LikeStatusTypeormEntity)
    protected likeStatusRepository: Repository<LikeStatusTypeormEntity>,
  ) {}

  async findManyPosts(
    sanitizedQuery: PostQueryType,
    user?: AccessTokenPayloadType,
  ): Promise<PostPagesType> {
    const beforeQuery = format(
      `
      WITH post_with_likes AS (SELECT *
        FROM post_typeorm_entity p
        LEFT JOIN LATERAL(
        SELECT *
        FROM like_status_typeorm_entity ls
        WHERE ls."entityId" = p.id AND ls.status = 'Like'
        ORDER BY "addedAt" DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE p."blogId" = $1 OR $1 IS NOT DISTINCT FROM NULL
          ),
        agregated_likes AS (
        SELECT
              pwl.id,
              json_agg(
                  json_build_object(
                  'addedAt', pwl."addedAt",
                  'userId', pwl."userId",
                  'login', pwl."userLogin"
                  )
                  ORDER BY pwl."addedAt" DESC
              ) FILTER (WHERE pwl."addedAt" IS NOT NULL) as newest_likes
        FROM post_with_likes pwl
        GROUP BY pwl.id
        )
    SELECT
        p.*,
        ls.status,
        al.newest_likes,
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = p.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = p.id
         ),
        COUNT(*) OVER() AS total_count
    FROM post_typeorm_entity p
    LEFT JOIN agregated_likes al ON al.id = p.id
    LEFT JOIN like_status_typeorm_entity ls ON ls."entityId" = p.id AND ls."userId" IS NOT DISTINCT FROM $2
    WHERE p."blogId" = $1 OR $1 IS NOT DISTINCT FROM NULL
        ORDER BY %I %s
        LIMIT $3
        OFFSET $4
    `,
      sanitizedQuery.sortBy,
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
        FROM post_typeorm_entity p
        LEFT JOIN LATERAL(
        SELECT *
        FROM like_status_typeorm_entity ls
        WHERE ls."entityId" = p.id AND ls.status = 'Like'
        ORDER BY "addedAt" DESC
        LIMIT 3
        ) newest_likes_table ON TRUE
        WHERE p.id = $1
          ),
        agregated_likes AS (
        SELECT
              json_agg(
                  json_build_object(
                  'addedAt', pwl."addedAt",
                  'userId', pwl."userId",
                  'login', pwl."userLogin"
                  )
                  ORDER BY pwl."addedAt" DESC
              ) FILTER (WHERE pwl."addedAt" IS NOT NULL) as newest_likes
        FROM post_with_likes pwl
        )
    SELECT
        p.*,
        ls2.status,
        al.newest_likes,
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Like') as likes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = p.id
         ),
         (
             SELECT COUNT (*) FILTER (WHERE status = 'Dislike') as dislikes_count
             FROM like_status_typeorm_entity
             WHERE "entityId" = p.id
         )
    FROM post_typeorm_entity p
    LEFT JOIN agregated_likes al ON TRUE
    LEFT JOIN like_status_typeorm_entity ls2 ON ls2."entityId" = p.id AND ls2."userId" IS NOT DISTINCT FROM $2
    WHERE p.id = $1
          `,
      [postId, user?.sub],
    );

    if (result.length === 0) {
      return null;
    }
    return mapToView.mapPost(result);
  }
}
