import { DeleteResult } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blog } from '../../../../Domain/blog.entity';
import { BlogTypeormEntity } from '../Entities/blog-typeorm.entity';
import { PostTypeormEntity } from '../Entities/post-typeorm.entity';
import { TypeormEntityMapper } from '../../../Mapper/typeorm-entity.mapper';

@Injectable()
export class BlogSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PostTypeormEntity)
    protected postRepository: Repository<PostTypeormEntity>,
    @InjectRepository(BlogTypeormEntity)
    protected blogRepository: Repository<BlogTypeormEntity>,
  ) {}

  async createNewBlog(blog: Blog): Promise<string> {
    const newBlogTypeormEntity: BlogTypeormEntity =
      TypeormEntityMapper.blogToTypeormEntity(blog);
    const result: BlogTypeormEntity =
      await this.blogRepository.save(newBlogTypeormEntity);
    return result.id;
  }

  async findById(blogId: string): Promise<Blog | null> {
    const result: BlogTypeormEntity | null =
      await this.blogRepository.findOneBy({ id: blogId });
    if (!result) {
      return null;
    }
    return TypeormEntityMapper.blogToDomainEntity(result);
  }

  async updateBlog(blog: Blog): Promise<boolean> {
    const result = await this.blogRepository.update(
      { id: blog.id },
      {
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
      },
    );
    return result.affected != 0;
  }

  async delete(blogId: string): Promise<boolean> {
    await this.postRepository.delete({ blogId: blogId });
    const result = await this.blogRepository.delete({ id: blogId });
    return result.affected != 0;
  }
}
