import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocumentType } from '../../Domain/post.schema';
import type { PostModelType } from '../../Domain/post.schema';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async save(post: PostDocumentType): Promise<PostDocumentType> {
    return await post.save();
  }

  async findById(postId: string): Promise<PostDocumentType | null> {
    return await this.PostModel.findOne({ id: postId });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.PostModel.deleteOne({ id: id });
    return result.deletedCount !== 0;
  }
}
