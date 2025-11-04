import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PostRepository } from '../Infrastructure/Repositories/post.repository';
import { BlogRepository } from '../Infrastructure/Repositories/blog.repository';
import { BlogDocumentType } from '../Domain/blog.schema';
import { Post, PostDocumentType } from '../Domain/post.schema';
import type { PostModelType } from '../Domain/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {CreatePostDTO, UpdatePostDTO} from '../Api/Input-dto/post.input-dto';
import { Types } from 'mongoose';
import { DomainException } from '../Domain/Exceptions/domain-exceptions';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) protected PostModel: PostModelType,
    @Inject(PostRepository) protected postRepository: PostRepository,
    @Inject(BlogRepository) protected blogRepository: BlogRepository,
  ) {}

  async createPost(
    newPostData: CreatePostDTO,
    blogIdFromParams?: string,
  ): Promise<string> {
    const neededBlogId: string = newPostData.blogId
      ? newPostData.blogId
      : blogIdFromParams
        ? blogIdFromParams
        : '';
    const neededBlog: BlogDocumentType | null =
      await this.blogRepository.findById(neededBlogId);
    if (!neededBlog) {
      throw new DomainException('Blog not found', HttpStatus.NOT_FOUND);
    }
    newPostData.blogId = neededBlogId;
    const newPost: PostDocumentType = neededBlog.createPostForBlog(
      newPostData,
      this.PostModel,
    );
    await this.postRepository.save(newPost);
    await this.blogRepository.save(neededBlog);
    return newPost._id.toString();
  }

  async updatePost(postId: string, newData: UpdatePostDTO): Promise<boolean> {
    const neededPost: PostDocumentType | null =
      await this.postRepository.findById(postId);
    if (!neededPost) {
      return false;
    }
    neededPost.updatePost(newData, newData.blogId);
    await this.postRepository.save(neededPost);
    return true;
  }

  async deletePost(postId: string): Promise<boolean> {

    const neededPost: PostDocumentType | null =
      await this.postRepository.findById(postId);
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }
    const neededBlog: BlogDocumentType | null =
      await this.blogRepository.findById(neededPost.blogId);
    if (!neededBlog) {
      throw new DomainException('Blog not found', HttpStatus.NOT_FOUND);
    }
    neededBlog.deletePost(postId);
    return await this.postRepository.delete(postId);
  }
}
