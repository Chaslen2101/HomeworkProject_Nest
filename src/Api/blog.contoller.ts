import { BlogQueryRep } from '../Infrastructure/Query-repositories/blog.query-repository';
import type {
  BlogPagesType,
  BlogViewType,
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../Types/Types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogService } from '../Application/blog.service';
import { PostQueryRep } from '../Infrastructure/Query-repositories/post.query-repository';
import { PostService } from '../Application/post.service';
import { ObjectId } from 'mongodb';
import { BlogInputDTO } from './Input-dto/blog.input-dto';
import { PostInputType } from './Input-dto/post.input-dto';

@Controller('blogs')
export class BlogController {
  constructor(
    protected blogQueryRep: BlogQueryRep,
    protected postQueryRep: PostQueryRep,
    protected blogService: BlogService,
    protected postService: PostService,
  ) {}

  @Get()
  @HttpCode(200)
  async returnAllBlogs(@Query() Query: InputQueryType): Promise<BlogPagesType> {
    return await this.blogQueryRep.findManyBlogs(Query);
  }

  @Post()
  @HttpCode(201)
  async createBlog(
    @Body() reqBody: BlogInputDTO,
  ): Promise<BlogViewType | null> {
    const createdBlogId: ObjectId = await this.blogService.createBlog(reqBody);
    return await this.blogQueryRep.findBlogByID(createdBlogId);
  }

  @Get(':id')
  @HttpCode(200)
  async findBlogById(@Param('id') blogId: string): Promise<BlogViewType> {
    const neededBlog: BlogViewType | null =
      await this.blogQueryRep.findBlogByID(blogId);
    if (neededBlog) {
      return neededBlog;
    } else {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') blogId: string,
    @Body() reqBody: BlogInputDTO,
  ): Promise<void> {
    try {
      await this.blogService.updateBlog(blogId, reqBody);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogByID(@Param('id') blogId: string): Promise<void> {
    const isDeleted: boolean = await this.blogService.deleteBlog(blogId);
    if (!isDeleted) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':blogId/posts')
  @HttpCode(200)
  async findPostsOfBlog(
    @Param('blogId') blogId: string,
    @Query() query: InputQueryType,
  ): Promise<PostPagesType> {
    const neededBlog: BlogViewType | null =
      await this.blogQueryRep.findBlogByID(blogId);
    if (!neededBlog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    } else {
      return await this.postQueryRep.findManyPosts(query, blogId);
    }
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() reqBody: PostInputType,
  ): Promise<PostViewType | null | undefined> {
    try {
      const newPostId: ObjectId = await this.postService.createPost(
        reqBody,
        blogId,
      );
      return await this.postQueryRep.findPostById(newPostId);
    } catch (e) {
      if (e instanceof Error) {
        throw new HttpException(e.message, HttpStatus.NOT_FOUND);
      }
    }
  }
}
