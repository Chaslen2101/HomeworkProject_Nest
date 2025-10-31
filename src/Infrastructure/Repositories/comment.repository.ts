import { Injectable } from '@nestjs/common';
import { Comment, CommentDocumentType } from '../../Domain/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: Model<CommentDocumentType>,
  ) {}
  async save(comment: CommentDocumentType): Promise<CommentDocumentType> {
    return await comment.save();
  }

  async findById(id: ObjectId): Promise<CommentDocumentType | null> {
    return this.CommentModel.findOne({ _id: id });
  }

  async deleteComment(id: ObjectId): Promise<boolean> {
    const result = await this.CommentModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
