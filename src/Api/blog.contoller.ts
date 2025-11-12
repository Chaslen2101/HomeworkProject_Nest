import { BlogQueryRep } from '../Infrastructure/Query-repositories/blog.query-repository';
import type {
  AccessTokenPayloadType,
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
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from '../Application/blog.service';
import { PostQueryRep } from '../Infrastructure/Query-repositories/post.query-repository';
import { PostService } from '../Application/post.service';
import {
  CreatePostForBlogInputDTO,
  CreateUpdateBlogInputDTO,
} from './Input-dto/blog.input-dto';
import { BasicGuard } from './Guards/Basic/basic.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('blogs')
export class BlogController {
  constructor(
    protected blogQueryRep: BlogQueryRep,
    protected postQueryRep: PostQueryRep,
    protected blogService: BlogService,
    protected postService: PostService,
    protected jwtService: JwtService,
  ) {}

  @Get()
  @HttpCode(200)
  async returnAllBlogs(@Query() Query: InputQueryType): Promise<BlogPagesType> {
    return await this.blogQueryRep.findManyBlogs(Query);
  }

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createBlog(
    @Body() reqBody: CreateUpdateBlogInputDTO,
  ): Promise<BlogViewType | null> {
    const createdBlogId: string = await this.blogService.createBlog(reqBody);
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
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updateBlogById(
    @Param('id') blogId: string,
    @Body() reqBody: CreateUpdateBlogInputDTO,
  ): Promise<void> {
    await this.blogService.updateBlog(blogId, reqBody);
    return;
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
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
    @Req() request: Request,
  ): Promise<PostPagesType> {
    const neededBlog: BlogViewType | null =
      await this.blogQueryRep.findBlogByID(blogId);
    if (!neededBlog) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    } else {
      const jwtToken: string | null = request.headers['authorization']
        ? (request.headers['authorization'] as string)
        : null;
      const user: AccessTokenPayloadType | undefined = jwtToken
        ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
        : undefined;
      return await this.postQueryRep.findManyPosts(query, user, blogId);
    }
  }

  @Post(':blogId/posts')
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() reqBody: CreatePostForBlogInputDTO,
  ): Promise<PostViewType | null | undefined> {
    const newPostId: string = await this.postService.createPost(
      reqBody,
      blogId,
    );

    return await this.postQueryRep.findPostById(newPostId);
  }
}
