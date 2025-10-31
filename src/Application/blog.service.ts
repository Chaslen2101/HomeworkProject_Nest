import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocumentType } from '../Domain/blog.schema';
import type { BlogModelType } from '../Domain/blog.schema';
import { BlogRepository } from '../Infrastructure/Repositories/blog.repository';
import { ObjectId } from 'mongodb';
import { BlogInputDTO } from '../Api/Input-dto/blog.input-dto';

@Injectable()
export class BlogService {
  constructor(
    @Inject(BlogRepository) protected blogRepository: BlogRepository,
    @InjectModel(Blog.name) protected BlogModel: BlogModelType,
  ) {}

  async createBlog(blogData: BlogInputDTO): Promise<ObjectId> {
    const newBlog: BlogDocumentType = this.BlogModel.createBlog(blogData);
    await this.blogRepository.save(newBlog);
    return newBlog._id;
  }

  async updateBlog(
    blogId: string,
    newBlogData: BlogInputDTO,
  ): Promise<boolean> {
    const neededBlog: BlogDocumentType | null =
      await this.blogRepository.findById(blogId);
    if (!neededBlog) {
      throw new Error('Blog not found');
    }
    neededBlog.updateBlogData(newBlogData);
    await this.blogRepository.save(neededBlog);
    return true;
  }

  async deleteBlog(id: string) {
    return await this.blogRepository.delete(id);
  }
}
