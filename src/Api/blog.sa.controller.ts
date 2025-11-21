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
import { BlogSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/blog-sql.query-repository';
import { PostSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/post-sql.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { BlogService } from '../Application/blog.service';
import { PostService } from '../Application/post.service';
import { JwtService } from '@nestjs/jwt';
import type {
  BlogPagesType,
  BlogViewType,
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../Types/Types';
import { queryHelper } from '../Core/helper';
import { BasicGuard } from './Guards/Basic/basic.guard';
import {
  CreatePostForBlogInputDTO,
  CreateUpdateBlogInputDTO,
} from './Input-dto/blog.input-dto';
import { CreateBlogCommand } from '../Application/UseCases/Blog/create-blog.usecase';
import { UpdateBlogCommand } from '../Application/UseCases/Blog/update-blog.usecase';
import { DeleteBlogCommand } from '../Application/UseCases/Blog/delete-blog.usecase';
import { CreatePostCommand } from '../Application/UseCases/Post/create-post.usecase';
import { UpdatePostDTO } from './Input-dto/post.input-dto';
import { UpdatePostCommand } from '../Application/UseCases/Post/update-post.usecase';
import { DeletePostCommand } from '../Application/UseCases/Post/delete-post.usecase';

@Controller('sa/blogs')
export class BlogSAController {
  constructor(
    @Inject(BlogSqlQueryRepository)
    protected blogQueryRep: BlogSqlQueryRepository,
    @Inject(PostSqlQueryRepository)
    protected postQueryRep: PostSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
    protected blogService: BlogService,
    protected postService: PostService,
    protected jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(BasicGuard)
  @HttpCode(200)
  async returnAllBlogs(@Query() Query: InputQueryType): Promise<BlogPagesType> {
    return await this.blogQueryRep.findManyBlogs(queryHelper.blogQuery(Query));
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
      // const jwtToken: string | null = request.headers['authorization']
      //   ? (request.headers['authorization'] as string)
      //   : null;
      // const user: AccessTokenPayloadType | undefined = jwtToken
      //   ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
      //   : undefined;
      return await this.postQueryRep.findManyPosts(
        queryHelper.postQuery(query, blogId),
      );
    }
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updatePostByID(
    @Param('postId') postId: string,
    @Body() reqBody: UpdatePostDTO,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(postId, reqBody));
    return;
  }

  @Delete(':blogId/posts/:postId')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deletePostById(@Param('postId') postId: string): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(postId));
    return;
  }
}
