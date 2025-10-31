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
} from '@nestjs/common';
import { CommentQueryRep } from '../Infrastructure/Query-repositories/comment.query-repository';
import { PostQueryRep } from '../Infrastructure/Query-repositories/post.query-repository';
import { CommentViewType } from '../Types/Types';
import { JwtGuard } from './Guards/Jwt/jwt.guard';
import {
  CreateUpdateCommentInputDTO,
  UpdateCommentLikeStatusDTO,
} from './Input-dto/comment.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../Application/UseCases/Comment/update-comment.usecase';
import { DeleteCommentCommand } from '../Application/UseCases/Comment/delete-comment.usecase';
import { UpdateCommentLikeStatusCommand } from '../Application/UseCases/Comment/update-likestatus.usecase';
import { UserPayloadDTO } from './Input-dto/auth.input-dto';

@Controller('comments')
export class CommentController {
  constructor(
    @Inject(PostQueryRep) protected postsQueryRep: PostQueryRep,
    @Inject(CommentQueryRep) protected commentsQueryRep: CommentQueryRep,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}

  @Get(':id')
  @HttpCode(200)
  async getCommentById(
    @Param('id') commentId: string,
  ): Promise<CommentViewType> {
    const neededComment: CommentViewType | null =
      await this.commentsQueryRep.findCommentById(commentId);

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
      new UpdateCommentCommand(reqBody, commentId, req.user as UserPayloadDTO),
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
      new DeleteCommentCommand(commentId, req.user as UserPayloadDTO),
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
  ) {
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        commentId,
        reqBody,
        req.user as UserPayloadDTO,
      ),
    );
    return;
  }
}
