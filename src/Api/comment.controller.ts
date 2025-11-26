import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Put,
  UseGuards,
  Request,
  Delete,
  Req,
} from '@nestjs/common';
import { AccessTokenPayloadType, CommentViewType } from '../Types/Types';
import { JwtGuard } from './Guards/Jwt/jwt.guard';
import {
  CreateUpdateCommentInputDTO,
  UpdateCommentLikeStatusDTO,
} from './Input-dto/comment.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../Application/UseCases/Comment/update-comment.usecase';
import { DeleteCommentCommand } from '../Application/UseCases/Comment/delete-comment.usecase';
import { JwtService } from '@nestjs/jwt';
import { PostSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/post-sql.query-repository';
import { CommentSqlQueryRepository } from '../Infrastructure/Query-repositories/SQL/comment-sql.query-repository';
import { UpdateCommentLikeStatusCommand } from '../Application/UseCases/Comment/update-comment-likestatus.usecase';

@Controller('comments')
export class CommentController {
  constructor(
    @Inject(PostSqlQueryRepository)
    protected postsQueryRep: PostSqlQueryRepository,
    @Inject(CommentSqlQueryRepository)
    protected commentsQueryRep: CommentSqlQueryRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
    protected jwtService: JwtService,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async getCommentById(
    @Param('id') commentId: string,
    @Req() request: Request,
  ): Promise<CommentViewType> {
    const jwtToken: string | null = request.headers['authorization']
      ? (request.headers['authorization'] as string)
      : null;
    const user: AccessTokenPayloadType | undefined = jwtToken
      ? this.jwtService.verify<AccessTokenPayloadType>(jwtToken.slice(7))
      : undefined;

    const neededComment: CommentViewType | null =
      await this.commentsQueryRep.findById(commentId, user);

    if (!neededComment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    return neededComment;
  }

  @Put(':commentId')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async updateComment(
    @Request() req: Express.Request,
    @Param('commentId') commentId: string,
    @Body() reqBody: CreateUpdateCommentInputDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand(
        reqBody,
        commentId,
        req.user as AccessTokenPayloadType,
      ),
    );
    return;
  }

  @Delete(':commentId')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async deleteCommentById(
    @Request() req: Express.Request,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentCommand(commentId, req.user as AccessTokenPayloadType),
    );
    return;
  }

  @Put(':commentId/like-status')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async updateLikeStatus(
    @Request() req: Express.Request,
    @Param('commentId') commentId: string,
    @Body() reqBody: UpdateCommentLikeStatusDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        commentId,
        reqBody,
        req.user as AccessTokenPayloadType,
      ),
    );
    return;
  }
}
