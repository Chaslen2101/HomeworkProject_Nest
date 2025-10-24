import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';

@Schema()
class CommentatorInfo {
  @Prop({ type: ObjectId, required: true })
  userId: ObjectId;

  @Prop({ type: String, required: true })
  userLogin: string;
}

@Schema()
class LikesInfo {
  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({ type: [String], default: [] })
  dislikedBy: [string];
}

export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  postId: ObjectId;

  @Prop({ type: LikesInfo, required: true })
  likesInfo: LikesInfo;
}

export type CommentDocumentType = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocumentType> & typeof Comment;
export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
// {
//     methods: {
//         updateCommentContent(this: CommentsInstanceType, newContent: string) {
//             this.content = newContent
//             return true
//         },
//
//         updateLikeStatus(this: CommentsInstanceType, likeStatus: string, userId: string) {
//
//             if (likeStatus === "Like") {
//
//                 if (!this.likesInfo.likedBy.includes(userId)) {
//
//                     this.likesInfo.likedBy.push(userId)
//
//                     const index: number = this.likesInfo.dislikedBy.indexOf(userId)
//                     if (index > -1) {
//                         this.likesInfo.dislikedBy.splice(index, 1)
//                     }
//                     return true
//                 }
//                 return true
//             }
//
//             if(likeStatus === "Dislike") {
//
//                 if (!this.likesInfo.dislikedBy.includes(userId)) {
//
//                     this.likesInfo.dislikedBy.push(userId)
//
//                     const index: number = this.likesInfo.likedBy.indexOf(userId)
//                     if (index > -1) {
//                         this.likesInfo.likedBy.splice(index, 1)
//                     }
//                     return true
//                 }
//                 return true
//             }
//
//             if(likeStatus === "None") {
//
//                 const likedByIndex: number = this.likesInfo.likedBy.indexOf(userId)
//                 if (likedByIndex > -1) {
//                     this.likesInfo.likedBy.splice(likedByIndex, 1)
//                 }
//
//                 const dislikedByIndex: number = this.likesInfo.dislikedBy.indexOf(userId)
//                 if (dislikedByIndex > -1) {
//                     this.likesInfo.dislikedBy.splice(dislikedByIndex, 1)
//                 }
//                 return true
//             }
//             return false
//         }
//
//     },
//     statics: {
//
//     }
// })
