import type {
  AccessTokenPayloadType,
  BlogPagesType,
  BlogViewType,
  InputQueryType,
  PostPagesType,
} from '../Domain/Types/Types';
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
import { JwtService } from '@nestjs/jwt';
import { queryHelper } from '../Infrastructure/Utils/helper';
import { BlogSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/blog-sql.query-repository';
import { PostSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/post-sql.query-repository';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
export class BlogController {
  constructor(
    @Inject(BlogSqlQueryRepository)
    protected blogQueryRep: BlogSqlQueryRepository,
    @Inject(PostSqlQueryRepository)
    protected postQueryRep: PostSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  @Get()
  @HttpCode(200)
  async returnAllBlogs(@Query() Query: InputQueryType): Promise<BlogPagesType> {
    return await this.blogQueryRep.findManyBlogs(queryHelper.blogQuery(Query));
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
        ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
        : undefined;
      return await this.postQueryRep.findManyPosts(
        queryHelper.postQuery(query, blogId),
        user,
      );
    }
  }
}
