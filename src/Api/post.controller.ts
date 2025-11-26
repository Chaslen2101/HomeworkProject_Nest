import {
  Body,
  Controller,
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
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../Application/post.service';
import type {
  AccessTokenPayloadType,
  CommentPagesType,
  CommentQueryType,
  CommentViewType,
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../Types/Types';
import { queryHelper } from '../Core/helper';
import { CommandBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { PostSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/post-sql.query-repository';
import { BlogSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/blog-sql.query-repository';
import { JwtGuard } from './Guards/Jwt/jwt.guard';
import {
  CreateCommentForPostDTO,
  UpdatePostLikeStatusDTO,
} from './Input-dto/post.input-dto';
import { UpdatePostLikeStatusCommand } from '../Application/UseCases/Post/update-post-likestatus.usecase';
import { CreateCommentForPostCommand } from '../Application/UseCases/Comment/create-comment-for-post.usecase';
import { CommentSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/comment-sql.query-repository';

@Controller('posts')
export class PostController {
  constructor(
    @Inject(PostSqlQueryRepository)
    protected postQueryRep: PostSqlQueryRepository,
    @Inject(BlogSqlQueryRepository)
    protected blogQueryRep: BlogSqlQueryRepository,
    @Inject(PostService) protected postService: PostService,
    @Inject(CommentSqlQueryRepository)
    protected commentsQueryRep: CommentSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  @Get()
  @HttpCode(200)
  async returnAllPosts(
    @Query() query: InputQueryType,
    @Req() request: Request,
  ): Promise<PostPagesType> {
    const jwtToken: string | null = request.headers['authorization']
      ? (request.headers['authorization'] as string)
      : null;
    const user: AccessTokenPayloadType | undefined = jwtToken
      ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
      : undefined;
    return await this.postQueryRep.findManyPosts(
      queryHelper.postQuery(query),
      user,
    );
  }

  @Get(':id')
  @HttpCode(200)
  async findPostById(
    @Param('id') postId: string,
    @Req() request: Request,
  ): Promise<PostViewType> {
    const jwtToken: string | null = request.headers['authorization']
      ? (request.headers['authorization'] as string)
      : null;
    const user: AccessTokenPayloadType | undefined = jwtToken
      ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
      : undefined;
    const neededPost: PostViewType | null =
      await this.postQueryRep.findPostById(postId, user);

    if (neededPost) {
      return neededPost;
    } else {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put(':postId/like-status')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async updateLikeStatus(
    @Request() req: Express.Request,
    @Param('postId') postId: string,
    @Body() reqBody: UpdatePostLikeStatusDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(
        postId,
        reqBody,
        req.user as AccessTokenPayloadType,
      ),
    );
    return;
  }

  @Post(':postId/comments')
  @UseGuards(JwtGuard)
  @HttpCode(201)
  async createCommentForPost(
    @Request() req: Express.Request,
    @Param('postId') postId: string,
    @Body() reqBody: CreateCommentForPostDTO,
  ): Promise<CommentViewType | null> {
    const newCommentId: string = await this.commandBus.execute(
      new CreateCommentForPostCommand(
        postId,
        reqBody,
        req.user as AccessTokenPayloadType,
      ),
    );

    return await this.commentsQueryRep.findById(
      newCommentId,
      req.user as AccessTokenPayloadType,
    );
  }

  @Get(':postId/comments')
  @HttpCode(200)
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() query: InputQueryType,
    @Req() request: Request,
  ): Promise<CommentPagesType> {
    const jwtToken: string | null = request.headers['authorization']
      ? (request.headers['authorization'] as string)
      : null;
    const user: AccessTokenPayloadType | undefined = jwtToken
      ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
      : undefined;

    const isPostExists: PostViewType | null =
      await this.postQueryRep.findPostById(postId);
    if (!isPostExists) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const sanitizedQuery: CommentQueryType = queryHelper.commentsQuery(query);

    return await this.commentsQueryRep.findByPostId(
      postId,
      sanitizedQuery,
      user,
    );
  }
}
