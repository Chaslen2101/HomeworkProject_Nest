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
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../Application/post.service';
import { BlogQueryRep } from '../Infrastructure/Query-repositories/blog.query-repository';
import { PostQueryRep } from '../Infrastructure/Query-repositories/post.query-repository';
import type {
  CommentPagesType,
  CommentQueryType,
  CommentViewType,
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../Types/Types';
import { ObjectId } from 'mongodb';
import { queryHelper } from '../Core/helper';
import { CommentQueryRep } from '../Infrastructure/Query-repositories/comment.query-repository';
import {
  CreateCommentForPostDTO,
  CreatePostDTO,
  UpdatePostLikeStatusDTO,
} from './Input-dto/post.input-dto';
import { JwtGuard } from './Guards/Jwt/jwt.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostLikeStatusCommand } from '../Application/UseCases/Post/update-likestatus.usecase';
import { UserPayloadDTO } from './Input-dto/auth.input-dto';
import { CreateCommentForPostCommand } from '../Application/UseCases/Post/create-comment-for-post.usecase';
import { BasicGuard } from './Guards/Basic/basic.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('posts')
export class PostController {
  constructor(
    @Inject(PostQueryRep) protected postQueryRep: PostQueryRep,
    @Inject(BlogQueryRep) protected blogQueryRep: BlogQueryRep,
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
    const jwtToken: string | null = request.headers.get('authorization');
    const user: UserPayloadDTO | undefined = jwtToken
      ? this.jwtService.verify<UserPayloadDTO>(jwtToken)
      : undefined;
    return await this.postQueryRep.findManyPosts(query, user);
  }

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createPost(
    @Request() req: Express.Request,
    @Body() reqBody: CreatePostDTO,
  ): Promise<PostViewType | null | undefined> {
    const createdPostId: ObjectId = await this.postService.createPost(reqBody);
    return await this.postQueryRep.findPostById(
      createdPostId,
      req.user as UserPayloadDTO,
    );
  }

  @Get(':id')
  @HttpCode(200)
  async findPostById(
    @Param('id') postId: string,
    @Req() request: Request,
  ): Promise<PostViewType> {
    const jwtToken: string | null = request.headers.get('authorization');
    const user: UserPayloadDTO | undefined = jwtToken
      ? this.jwtService.verify<UserPayloadDTO>(jwtToken)
      : undefined;
    const neededPost: PostViewType | null =
      await this.postQueryRep.findPostById(postId, user);

    if (neededPost) {
      return neededPost;
    } else {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async updatePostByID(
    @Param('id') postId: string,
    @Body() reqBody: CreatePostDTO,
  ): Promise<void> {
    const isUpdated: boolean = await this.postService.updatePost(
      postId,
      reqBody,
    );
    if (!isUpdated) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  async deletePostById(@Param('id') postId: string): Promise<void> {
    await this.postService.deletePost(postId);
  }

  @Get(':postId/comments')
  @HttpCode(200)
  async getCommentsForPost(
    @Param('id') postId: string,
    @Query() query: InputQueryType,
    @Req() request: Request,
  ) {
    const jwtToken: string | null = request.headers.get('authorization');
    const user: UserPayloadDTO | undefined = jwtToken
      ? this.jwtService.verify<UserPayloadDTO>(jwtToken)
      : undefined;

    const isPostExists: PostViewType | null =
      await this.postQueryRep.findPostById(postId);
    if (!isPostExists) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const sanitizedQuery: CommentQueryType = queryHelper.commentsQuery(query);
    const commentsToView: CommentPagesType =
      await this.commentsQueryRep.findManyCommentsByPostId(
        postId,
        sanitizedQuery,
        user,
      );
    return commentsToView;
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
        req.user as UserPayloadDTO,
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
  ) {
    const newCommentId: string = await this.commandBus.execute(
      new CreateCommentForPostCommand(
        postId,
        reqBody,
        req.user as UserPayloadDTO,
      ),
    );
    const newComment: CommentViewType | null =
      await this.commentsQueryRep.findCommentById(
        newCommentId,
        req.user as UserPayloadDTO,
      );
    return newComment;
  }
}
