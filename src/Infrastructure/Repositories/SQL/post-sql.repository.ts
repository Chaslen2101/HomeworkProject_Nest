import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Post } from '../../../Domain/post.entity';

@Injectable()
export class PostSqlRepository {
  constructor(@InjectDataSource() public dataSource: DataSource) {}

  async createNewPost(post: Post): Promise<string> {
    const result = await this.dataSource.query(
      `
        INSERT INTO "post"
                (id, title, short_description, content, blog_id, blog_name, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `,
      [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.createdAt,
      ],
    );
    return result[0];
  }

  async updatePost(post: Post): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE "post"
        SET title = $1, short_description = $2, content = $3
        WHERE id = $4
        `,
      [post.title, post.shortDescription, post.content, post.id],
    );

    return;
  }

  async findById(postId: string): Promise<Post | null> {
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
    return new Post(
      result[0].id,
      result[0].title,
      result[0].short_description,
      result[0].content,
      result[0].blog_id,
      result[0].blog_name,
      result[0].created_at,
    );
  }

  async delete(postId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        DELETE FROM "post"
        WHERE id = $1
        `,
      [postId],
    );
    return result[1] === 1;
  }
}
