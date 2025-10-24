import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
} from '@nestjs/common';
import { CommentQueryRep } from '../Infrastructure/Query-repositories/comment.query-repository';
import { PostQueryRep } from '../Infrastructure/Query-repositories/post.query-repository';
import { CommentViewType } from '../Types/Types';

@Controller('comments')
export class CommentController {
  constructor(
    @Inject(PostQueryRep) protected postsQueryRep: PostQueryRep,
    @Inject(CommentQueryRep) protected commentsQueryRep: CommentQueryRep,
  ) {}

  @Get(':id')
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
}

//   async updateCommentById(req: Request, res: Response) {
//     try {
//       await this.commentsService.updateComment(
//         req.body.content,
//         req.params.commentId,
//         req.user.id,
//       );
//       res.status(httpStatuses.NO_CONTENT_204).json({});
//     } catch (e) {
//       if (e instanceof Error) {
//         if (e.message === 'Cant find needed comment') {
//           res.status(httpStatuses.NOT_FOUND_404).json({});
//         }
//
//         if (e.message === 'You cant update foreign comment') {
//           res.status(httpStatuses.FORBIDDEN_403).json({});
//         }
//       }
//     }
//   }
//
//   async deleteCommentById(req: Request, res: Response) {
//     try {
//       await this.commentsService.deleteComment(
//         req.params.commentId,
//         req.user.id,
//       );
//       res.status(httpStatuses.NO_CONTENT_204).json({});
//     } catch (e) {
//       if (e instanceof Error) {
//         if (e.message === 'Cant find needed comment') {
//           res.status(httpStatuses.NOT_FOUND_404).json({});
//         }
//
//         if (e.message === 'You cant delete foreign comment') {
//           res.status(httpStatuses.FORBIDDEN_403).json({});
//         }
//       }
//     }
//   }
//
//   async updateLikeStatus(req: Request, res: Response) {
//     try {
//       await this.commentsService.updateLikeStatus(
//         req.params.commentId,
//         req.body.likeStatus,
//         req.user.id,
//       );
//
//       res.status(httpStatuses.NO_CONTENT_204).json({});
//     } catch (e) {
//       if (e === 'Cant find needed comment') {
//         res.status(httpStatuses.NOT_FOUND_404).json({});
//       }
//
//       if (e === 'Invalid like status') {
//         res.status(httpStatuses.BAD_REQUEST_400).json({
//           message: e,
//           field: 'likeStatus',
//         });
//       }
//     }
//   }
// }
