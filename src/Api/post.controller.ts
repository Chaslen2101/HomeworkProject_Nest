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
  CommentPagesType,
  CommentQueryType,
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../Types/Types';
import { ObjectId } from 'mongodb';
import { queryHelper } from '../Core/helper';
import { CommentQueryRep } from '../Infrastructure/Query-repositories/comment.query-repository';
import { PostInputDTO } from './Input-dto/post.input-dto';

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
    return await this.postQueryRep.findManyPosts(query);
  }

  @Post()
  @HttpCode(201)
  async createPost(
    @Body() reqBody: PostInputDTO,
  ): Promise<PostViewType | null | undefined> {
    try {
      const createdPostId: ObjectId =
        await this.postService.createPost(reqBody);
      return await this.postQueryRep.findPostById(createdPostId);
    } catch (e) {
      if (e instanceof Error) {
        throw new HttpException(e.message, HttpStatus.NOT_FOUND);
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
    @Body() reqBody: PostInputDTO,
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
        console.log(e.message);
        throw new HttpException(e.message, HttpStatus.NOT_FOUND);
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
