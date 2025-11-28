import { DeleteResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../../../../Domain/blog.entity';

@Injectable()
export class BlogSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createNewBlog(blog: Blog): Promise<string> {
    const result = await this.dataSource.query(
      `
        INSERT INTO "blog"
                (name,description,website_url,created_at, is_membership, id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
      [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.createdAt,
        blog.isMembership,
        blog.id,
      ],
    );
    return result[0];
  }

  async findById(blogId: string): Promise<Blog | null> {
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
    return new Blog(
      result[0].id,
      result[0].name,
      result[0].description,
      result[0].website_url,
      result[0].created_at,
      result[0].is_membership,
    );
  }

  async updateBlog(blog: Blog): Promise<void> {
    await this.dataSource.query(
      `
          UPDATE "blog"
          SET name = $1, description = $2, website_url = $3
          WHERE id = $4
          `,
      [blog.name, blog.description, blog.websiteUrl, blog.id],
    );
    return;
  }

  async delete(blogId: string): Promise<boolean> {
    await this.dataSource.query(
      `
        DELETE FROM "post"
        WHERE blog_id = $1
        `,
      [blogId],
    );

    const result = await this.dataSource.query(
      `
        DELETE FROM "blog"
        WHERE id = $1
        `,
      [blogId],
    );
    return result[1] === 1;
  }
}
