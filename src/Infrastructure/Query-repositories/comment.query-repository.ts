import { Injectable } from '@nestjs/common';
import {
  CommentQueryType,
  CommentPagesType,
  CommentViewType,
} from '../../Types/Types';
import { mapToView } from '../../Core/helper';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocumentType, Comment } from '../../Domain/comment.schema';
import type { CommentModelType } from '../../Domain/comment.schema';
import { SortDirection } from 'mongodb';
import { UserPayloadDTO } from '../../Api/Input-dto/auth.input-dto';

@Injectable()
export class CommentQueryRep {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  async findCommentById(
    commentId: string,
    user?: UserPayloadDTO,
  ): Promise<CommentViewType | null> {
    const comment: CommentDocumentType | null = await this.CommentModel.findById(
      commentId,
    );
    if (!comment) {
      return null;
    }
    return mapToView.mapComment(comment, user?.sub);
  }

  async findManyCommentsByPostId(
    postId: string,
    query: CommentQueryType,
    user?: UserPayloadDTO,
  ): Promise<CommentPagesType> {
    const items: CommentDocumentType[] = await this.CommentModel.find({
      postId: postId,
    })
      .sort({ [query.sortBy]: query.sortDirection as SortDirection })
      .limit(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize);
    const totalCount: number = await this.CommentModel.countDocuments({
      postId: postId,
    });
    const mappedComments: CommentViewType[] = mapToView.mapComments(
      items,
      user?.sub,
    );
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: mappedComments,
    };
  }
}
