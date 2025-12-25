import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { BlogSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/blog-sql.query-repository';
import { PostSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/post-sql.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import {
  BlogPagesType,
  BlogViewType,
  PostPagesType,
} from './Types/bloggers-platform.view-model.types';
import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';
import type { InputQueryType } from '../../Common/Types/input-query.types';
import {
  BlogQueryType,
  PostQueryType,
} from './Types/bloggers-platform.input-query.types';
import { bloggersPlatformQueryHelper } from './Helpers/bloggers-platform.query.helper';
import { AuthExternalService } from '../../UserAccounts/Application/auth.external-service';

@Controller('blogs')
export class BlogController {
  constructor(
    @Inject(BlogSqlQueryRepository)
    protected blogQueryRep: BlogSqlQueryRepository,
    @Inject(PostSqlQueryRepository)
    protected postQueryRep: PostSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(AuthExternalService) protected jwtService: AuthExternalService,
  ) {}

  @Get()
  @HttpCode(200)
  async returnAllBlogs(@Query() Query: InputQueryType): Promise<BlogPagesType> {
    const sanitizedQuery: BlogQueryType =
      bloggersPlatformQueryHelper.blogQuery(Query);
    return await this.blogQueryRep.findManyBlogs(sanitizedQuery);
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
        ? await this.jwtService.verify(jwtToken.slice(7))
        : undefined;
      const sanitizedQuery: PostQueryType =
        bloggersPlatformQueryHelper.postQuery(query, blogId);
      return await this.postQueryRep.findManyPosts(sanitizedQuery, user);
    }
  }
}
