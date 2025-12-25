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
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlogSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/blog-sql.query-repository';
import { PostSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/post-sql.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { BasicGuard } from '../../Common/Guards/basic.guard';
import {
  CreatePostForBlogInputDTO,
  CreateUpdateBlogInputDTO,
} from './InputDTOValidators/blog-input-dto.validator';
import { CreateBlogCommand } from '../Application/UseCases/Blog/create-blog.usecase';
import { UpdateBlogCommand } from '../Application/UseCases/Blog/update-blog.usecase';
import { DeleteBlogCommand } from '../Application/UseCases/Blog/delete-blog.usecase';
import { CreatePostCommand } from '../Application/UseCases/Post/create-post.usecase';
import { UpdatePostDTO } from './InputDTOValidators/post-input-dto.validator';
import { UpdatePostCommand } from '../Application/UseCases/Post/update-post.usecase';
import { DeletePostCommand } from '../Application/UseCases/Post/delete-post.usecase';
import {
  BlogPagesType,
  BlogViewType,
  PostPagesType,
  PostViewType,
} from './Types/bloggers-platform.view-model.types';
import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';
import type { InputQueryType } from '../../Common/Types/input-query.types';

import { bloggersPlatformQueryHelper } from './Helpers/bloggers-platform.query.helper';
import {
  BlogQueryType,
  PostQueryType,
} from './Types/bloggers-platform.input-query.types';
import { AuthExternalService } from '../../UserAccounts/Application/auth.external-service';

@Controller('sa/blogs')
export class BlogSAController {
  constructor(
    @Inject(BlogSqlQueryRepository)
    protected blogQueryRep: BlogSqlQueryRepository,
    @Inject(PostSqlQueryRepository)
    protected postQueryRep: PostSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(AuthExternalService) protected jwtService: AuthExternalService,
  ) {}

  @Get()
  @UseGuards(BasicGuard)
  @HttpCode(200)
  async returnAllBlogs(@Query() Query: InputQueryType): Promise<BlogPagesType> {
    const sanitizedQuery: BlogQueryType =
      bloggersPlatformQueryHelper.blogQuery(Query);
    return await this.blogQueryRep.findManyBlogs(sanitizedQuery);
  }

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createBlog(
    @Body() reqBody: CreateUpdateBlogInputDTO,
  ): Promise<BlogViewType | null> {
    const createdBlogId: string = await this.commandBus.execute(
      new CreateBlogCommand(reqBody),
    );
    return await this.blogQueryRep.findBlogByID(createdBlogId);
  }

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updateBlogById(
    @Param('id') blogId: string,
    @Body() reqBody: CreateUpdateBlogInputDTO,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(blogId, reqBody));
    return;
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deleteBlogByID(@Param('id') blogId: string): Promise<void> {
    const isDeleted: boolean = await this.commandBus.execute(
      new DeleteBlogCommand(blogId),
    );
    if (!isDeleted) {
      throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post(':blogId/posts')
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() reqBody: CreatePostForBlogInputDTO,
  ): Promise<PostViewType | null | undefined> {
    const newPostId: string = await this.commandBus.execute(
      new CreatePostCommand(reqBody, blogId),
    );

    return await this.postQueryRep.findPostById(newPostId);
  }

  @Get(':blogId/posts')
  @UseGuards(BasicGuard)
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
        ? await this.jwtService.verify(jwtToken.slice(7))
        : undefined;
      const sanitizedQuery: PostQueryType =
        bloggersPlatformQueryHelper.postQuery(query, blogId);
      return await this.postQueryRep.findManyPosts(sanitizedQuery);
    }
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updatePostByID(
    @Param('postId') postId: string,
    @Param('blogId') blogId: string,
    @Body() reqBody: UpdatePostDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostCommand(postId, reqBody, blogId),
    );
    return;
  }

  @Delete(':blogId/posts/:postId')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deletePostById(
    @Param('postId') postId: string,
    @Param('blogId') blogId: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(postId, blogId));
    return;
  }
}
