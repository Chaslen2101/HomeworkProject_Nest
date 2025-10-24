// import { Injectable } from '@nestjs/common';
// import { CommentDocumentType } from '../../Domain/comment.schema';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
//
// @Injectable()
// export class CommentRepository {
//   constructor(
//     @InjectModel(Comment.name)
//     private CommentModel: Model<CommentDocumentType>,
//   ) {}
//   async save(comment: CommentDocumentType): Promise<CommentDocumentType> {
//     return await comment.save();
//   }
//
//   async findById(id: string): Promise<CommentDocumentType | null> {
//     return this.CommentModel.findOne({ id: id });
//   }
//
//   async deleteComment(id: string): Promise<boolean> {
//     const result = await this.CommentModel.deleteOne({ id: id });
//     return result.deletedCount === 1;
//   }
// }
