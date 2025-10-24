import { BlogQueryRep } from '../Infrastructure/Query-repositories/blog.query-repository';
import type {
  BlogInputType,
  BlogPagesType,
  BlogViewType,
  InputQueryType,
  PostInputType,
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

@Controller('blogs')
export class BlogController {
  constructor(
    protected blogsQueryRep: BlogQueryRep,
    protected postsQueryRep: PostQueryRep,
    protected blogsService: BlogService,
    protected postsService: PostService,
  ) {}

  @Get()
  async returnAllBlogs(@Query() Query: InputQueryType): Promise<BlogPagesType> {
    return await this.blogsQueryRep.findManyBlogs(Query);
  }

  @Post()
  @HttpCode(200)
  async createBlog(
    @Body() reqBody: BlogInputType,
  ): Promise<BlogViewType | null> {
    const createdBlogId: ObjectId = await this.blogsService.createBlog(reqBody);
    return await this.blogsQueryRep.findBlogByID(createdBlogId);
  }

  @Get(':id')
  @HttpCode(200)
  async findBlogById(@Param('id') blogId: string): Promise<BlogViewType> {
    const neededBlog: BlogViewType | null =
      await this.blogsQueryRep.findBlogByID(blogId);
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
    @Body() reqBody: BlogInputType,
  ): Promise<void> {
    try {
      await this.blogsService.updateBlog(blogId, reqBody);
    } catch (e) {
      if (e === 'Cant find needed blog') {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlogByID(@Param('id') blogId: string): Promise<void> {
    const isDeleted: boolean = await this.blogsService.deleteBlog(blogId);
    if (!isDeleted) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':blogId/posts')
  @HttpCode(200)
  async findPostsOfBlog(
    @Param('blogId') blogId: string,
    @Body() reqBody: PostInputType,
    @Query() query: InputQueryType,
  ): Promise<PostPagesType> {
    const neededBlog: BlogViewType | null =
      await this.blogsQueryRep.findBlogByID(blogId);
    if (!neededBlog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    } else {
      return await this.postsQueryRep.findManyPosts(query, blogId);
    }
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() reqBody: PostInputType,
  ): Promise<PostViewType | null | undefined> {
    try {
      const newPostId: ObjectId = await this.postsService.createPost(
        reqBody,
        blogId,
      );
      return await this.postsQueryRep.findPostById(newPostId);
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'Cant find needed blog') {
          throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
        }
      }
    }
  }
}
