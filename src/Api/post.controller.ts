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
  Request,
} from '@nestjs/common';
import { PostService } from '../Application/post.service';
import type {
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../Types/Types';
import { queryHelper } from '../Core/helper';
import { CommentQueryRep } from '../Infrastructure/Query-repositories/comment.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { PostSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/post-sql.query-repository';
import { BlogSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/blog-sql.query-repository';

@Controller('posts')
export class PostController {
  constructor(
    @Inject(PostSqlQueryRepository)
    protected postQueryRep: PostSqlQueryRepository,
    @Inject(BlogSqlQueryRepository)
    protected blogQueryRep: BlogSqlQueryRepository,
    @Inject(PostService) protected postService: PostService,
    @Inject(CommentQueryRep) protected commentsQueryRep: CommentQueryRep,
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  @Get()
  @HttpCode(200)
  async returnAllPosts(
    @Query() query: InputQueryType,
    @Req() request: Request,
  ): Promise<PostPagesType> {
    // const jwtToken: string | null = request.headers['authorization']
    //   ? (request.headers['authorization'] as string)
    //   : null;
    // const user: AccessTokenPayloadType | undefined = jwtToken
    //   ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
    //   : undefined;
    return await this.postQueryRep.findManyPosts(queryHelper.postQuery(query));
  }

  @Get(':id')
  @HttpCode(200)
  async findPostById(
    @Param('id') postId: string,
    @Req() request: Request,
  ): Promise<PostViewType> {
    // const jwtToken: string | null = request.headers['authorization']
    //   ? (request.headers['authorization'] as string)
    //   : null;
    // const user: AccessTokenPayloadType | undefined = jwtToken
    //   ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
    //   : undefined;
    const neededPost: PostViewType | null =
      await this.postQueryRep.findPostById(postId);

    if (neededPost) {
      return neededPost;
    } else {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  // @Get(':postId/comments')
  // @HttpCode(200)
  // async getCommentsForPost(
  //   @Param('postId') postId: string,
  //   @Query() query: InputQueryType,
  //   @Req() request: Request,
  // ) {
  //   const jwtToken: string | null = request.headers['authorization']
  //     ? (request.headers['authorization'] as string)
  //     : null;
  //   const user: AccessTokenPayloadType | undefined = jwtToken
  //     ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
  //     : undefined;
  //
  //   const isPostExists: PostViewType | null =
  //     await this.postQueryRep.findPostById(postId);
  //   if (!isPostExists) {
  //     throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  //   }
  //
  //   const sanitizedQuery: CommentQueryType = queryHelper.commentsQuery(query);
  //   const commentsToView: CommentPagesType =
  //     await this.commentsQueryRep.findManyCommentsByPostId(
  //       postId,
  //       sanitizedQuery,
  //       user,
  //     );
  //   return commentsToView;
  // }
  //
  // @Put(':postId/like-status')
  // @UseGuards(JwtGuard)
  // @HttpCode(204)
  // async updateLikeStatus(
  //   @Request() req: Express.Request,
  //   @Param('postId') postId: string,
  //   @Body() reqBody: UpdatePostLikeStatusDTO,
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new UpdatePostLikeStatusCommand(
  //       postId,
  //       reqBody,
  //       req.user as AccessTokenPayloadType,
  //     ),
  //   );
  //   return;
  // }
  //
  // @Post(':postId/comments')
  // @UseGuards(JwtGuard)
  // @HttpCode(201)
  // async createCommentForPost(
  //   @Request() req: Express.Request,
  //   @Param('postId') postId: string,
  //   @Body() reqBody: CreateCommentForPostDTO,
  // ) {
  //   const newCommentId: string = await this.commandBus.execute(
  //     new CreateCommentForPostCommand(
  //       postId,
  //       reqBody,
  //       req.user as AccessTokenPayloadType,
  //     ),
  //   );
  //   const newComment: CommentViewType | null =
  //     await this.commentsQueryRep.findCommentById(
  //       newCommentId,
  //       req.user as AccessTokenPayloadType,
  //     );
  //   return newComment;
  // }
}
