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
import { CommandBus } from '@nestjs/cqrs';
import { PostSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/post-sql.query-repository';
import { BlogSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/blog-sql.query-repository';
import { JwtGuard } from '../../Common/Guards/jwt.guard';
import {
  CreateCommentForPostDTO,
  UpdatePostLikeStatusDTO,
} from './InputDTOValidators/post-input-dto.validator';
import { UpdatePostLikeStatusCommand } from '../Application/UseCases/Post/update-post-likestatus.usecase';
import { CreateCommentForPostCommand } from '../Application/UseCases/Comment/create-comment-for-post.usecase';
import { CommentSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/comment-sql.query-repository';
import {
  CommentQueryType,
  PostQueryType,
} from './Types/bloggers-platform.input-query.types';
import {
  CommentPagesType,
  CommentViewType,
  PostPagesType,
  PostViewType,
} from './Types/bloggers-platform.view-model.types';
import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';
import type { InputQueryType } from '../../Common/Types/input-query.types';

import { bloggersPlatformQueryHelper } from './Helpers/bloggers-platform.query.helper';
import { AuthExternalService } from '../../UserAccounts/Application/auth.external-service';

@Controller('posts')
export class PostController {
  constructor(
    @Inject(PostSqlQueryRepository)
    protected postQueryRep: PostSqlQueryRepository,
    @Inject(BlogSqlQueryRepository)
    protected blogQueryRep: BlogSqlQueryRepository,
    @Inject(CommentSqlQueryRepository)
    protected commentsQueryRep: CommentSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(AuthExternalService) protected jwtService: AuthExternalService,
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
      ? await this.jwtService.verify(jwtToken.slice(7))
      : undefined;
    const sanitizedQuery: PostQueryType =
      bloggersPlatformQueryHelper.postQuery(query);
    return await this.postQueryRep.findManyPosts(sanitizedQuery, user);
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
      ? await this.jwtService.verify(jwtToken.slice(7))
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
      ? await this.jwtService.verify(jwtToken.slice(7))
      : undefined;

    const isPostExists: PostViewType | null =
      await this.postQueryRep.findPostById(postId);
    if (!isPostExists) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const sanitizedQuery: CommentQueryType =
      bloggersPlatformQueryHelper.commentsQuery(query);

    return await this.commentsQueryRep.findByPostId(
      postId,
      sanitizedQuery,
      user,
    );
  }
}
