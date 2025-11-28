import { Injectable } from '@nestjs/common';

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment } from '../../../../Domain/comment.entity';

@Injectable()
export class CommentSqlRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}
  async createNew(comment: Comment): Promise<string> {
    const result = await this.dataSource.query(
      `
        INSERT INTO "comment" (id, content, user_id, user_login, created_at, post_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
      [
        comment.id,
        comment.content,
        comment.commentatorInfo.userId,
        comment.commentatorInfo.userLogin,
        comment.createdAt,
        comment.postId,
      ],
    );
    return result[0];
  }

  async update(comment: Comment): Promise<void> {
    await this.dataSource.query(
      `
          UPDATE comment 
          SET content = $1
          WHERE id = $2
          `,
      [comment.content, comment.id],
    );
    return;
  }

  async findById(id: string): Promise<Comment | null> {
    const result = await this.dataSource.query(
      `
          SELECT *
          FROM comment
          WHERE id = $1
          `,
      [id],
    );
    if (result.length === 0) {
      return null;
    }
    return new Comment(
      result[0].id,
      result[0].content,
      { userId: result[0].user_id, userLogin: result[0].user_login },
      result[0].created_at,
      result[0].post_id,
    );
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
          DELETE FROM comment
          WHERE id = $1
          `,
      [id],
    );
    return result[1] === 1;
  }
}
