import { DeleteResult, ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../Domain/blog.schema';
import type { BlogModelType, BlogDocumentType } from '../../Domain/blog.schema';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async save(blog: BlogDocumentType): Promise<BlogDocumentType> {
    return await blog.save();
  }

  async findById(blogId: string | ObjectId): Promise<BlogDocumentType | null> {
    return this.BlogModel.findOne({ _id: blogId });
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    const result: DeleteResult = await this.BlogModel.deleteOne({ _id: id });
    return result.deletedCount !== 0;
  }
}
