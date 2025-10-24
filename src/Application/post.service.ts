import { Inject, Injectable } from '@nestjs/common';
import { PostRepository } from '../Infrastructure/Repositories/post.repository';
import { BlogRepository } from '../Infrastructure/Repositories/blog.repository';
import { BlogDocumentType } from '../Domain/blog.schema';
import { PostInputType } from '../Types/Types';
import { Post, PostDocumentType } from '../Domain/post.schema';
import type { PostModelType } from '../Domain/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) protected PostModel: PostModelType,
    @Inject(PostRepository) protected postRepository: PostRepository,
    @Inject(BlogRepository) protected blogRepository: BlogRepository,
  ) {}

  async createPost(
    newPostData: PostInputType,
    blogIdFromParams?: string,
  ): Promise<ObjectId> {
    const neededBlogId: string = newPostData.blogId
      ? newPostData.blogId
      : blogIdFromParams
        ? blogIdFromParams
        : '';
    const neededBlog: BlogDocumentType | null =
      await this.blogRepository.findById(neededBlogId);
    if (!neededBlog) {
      throw new Error('Blog not found');
    }
    newPostData.blogId = neededBlogId;
    const newPost: PostDocumentType = neededBlog.createPostForBlog(
      newPostData,
      this.PostModel,
    );
    await this.postRepository.save(newPost);
    return newPost._id;
  }

  async updatePost(postId: string, newData: PostInputType): Promise<boolean> {
    const neededPost: PostDocumentType | null =
      await this.postRepository.findById(postId);
    if (!neededPost) {
      return false;
    }
    neededPost.updatePost(newData);
    await this.postRepository.save(neededPost);
    return true;
  }

  async deletePost(id: string): Promise<boolean> {
    const neededPost: PostDocumentType | null =
      await this.postRepository.findById(id);
    if (!neededPost) {
      throw new Error('Post not found');
    }
    const neededBlog: BlogDocumentType | null =
      await this.blogRepository.findById(neededPost.blogId);
    if (!neededBlog) {
      throw new Error('Post has invalid blogID');
    }
    neededBlog.deletePost(id);
    return await this.postRepository.delete(id);
  }
}
