import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostService } from '../Application/post.service';
import { BlogQueryRep } from '../Infrastructure/Query-repositories/blog.query-repository';
import { PostQueryRep } from '../Infrastructure/Query-repositories/post.query-repository';
import type {
  CommentQueryType,
  CommentPagesType,
  InputQueryType,
  PostInputType,
  PostPagesType,
  PostViewType,
} from '../Types/Types';
import { ObjectId } from 'mongodb';
import { queryHelper } from '../Application/helper';
import { CommentQueryRep } from '../Infrastructure/Query-repositories/comment.query-repository';

@Controller('posts')
export class PostController {
  constructor(
    @Inject(PostQueryRep) protected postQueryRep: PostQueryRep,
    @Inject(BlogQueryRep) protected blogQueryRep: BlogQueryRep,
    @Inject(PostService) protected postService: PostService,
    @Inject(CommentQueryRep) protected commentsQueryRep: CommentQueryRep,
  ) {}

  @Get()
  @HttpCode(200)
  async returnAllPosts(@Query() query: InputQueryType): Promise<PostPagesType> {
    const posts: PostPagesType = await this.postQueryRep.findManyPosts(query);
    return posts;
  }

  @Post()
  @HttpCode(201)
  async createPost(
    @Body() reqBody: PostInputType,
  ): Promise<PostViewType | null | undefined> {
    try {
      const createdPostId: ObjectId =
        await this.postService.createPost(reqBody);
      const createdPost: PostViewType | null =
        await this.postQueryRep.findPostById(createdPostId);
      return createdPost;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'Cant find needed blog') {
          throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
        }
      }
    }
  }

  @Get(':id')
  @HttpCode(200)
  async findPostById(@Param('id') postId: string): Promise<PostViewType> {
    const neededPost: PostViewType | null =
      await this.postQueryRep.findPostById(postId);
    if (neededPost) {
      return neededPost;
    } else {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @HttpCode(204)
  async updatePostByID(
    @Param('id') postId: string,
    @Body() reqBody: PostInputType,
  ): Promise<void> {
    const isUpdated: boolean = await this.postService.updatePost(
      postId,
      reqBody,
    );
    if (!isUpdated) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deletePostById(@Param('id') postId: string): Promise<void> {
    try {
      await this.postService.deletePost(postId);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'Cant find needed post') {
          throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }
      }
    }
  }

  @Get(':id/comments')
  @HttpCode(200)
  async getCommentsForPost(
    @Param('id') postId: string,
    @Query() query: InputQueryType,
  ) {
    const isPostExists: PostViewType | null =
      await this.postQueryRep.findPostById(postId);
    if (!isPostExists) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      return;
    }

    const sanitizedQuery: CommentQueryType = queryHelper.commentsQuery(query);
    const commentsToView: CommentPagesType =
      await this.commentsQueryRep.findManyCommentsByPostId(
        postId,
        sanitizedQuery,
      );
    return commentsToView;
  }
}
