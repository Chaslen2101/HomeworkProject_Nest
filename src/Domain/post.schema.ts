import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { PostInputDTO } from '../Api/Input-dto/post.input-dto';

@Schema({ _id: false })
class NewestLikes {
  @Prop({ type: MongooseSchema.Types.Date })
  addedAt: Date;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  login: string;
}

@Schema({ _id: false })
class LikesInfo {
  @Prop({ type: [String], default: [] })
  likedBy: string[];

  @Prop({ type: [String], default: [] })
  dislikedBy: string[];

  @Prop({ type: [NewestLikes], default: [] })
  newestLikes: NewestLikes[];
}

@Schema()
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  createdAt: Date;

  @Prop({ type: [], required: true, default: [] })
  comments: [];

  @Prop({ type: LikesInfo })
  likesInfo: LikesInfo;

  updatePost(this: PostDocumentType, newData: PostInputDTO): boolean {
    this.title = newData.title;
    this.shortDescription = newData.shortDescription;
    this.content = newData.content;
    this.blogId = newData.blogId;
    return true;
  }
}
//     {
//         methods: {
//

//             },
//
//             createComment(this: PostsInstanceType, content: string, userInfo: UserViewType) {
//
//                 const newComment: CommentsInstanceType = new CommentsModel({
//                     id: new ObjectId().toString(),
//                     content: content,
//                     commentatorInfo: {
//                         userId: userInfo.id,
//                         userLogin: userInfo.login
//                     },
//                     createdAt: new Date(),
//                     postId: this.id,
//                     likesInfo: {
//                         likedBy: [],
//                         dislikedBy: []
//                     }
//                 })
//                 this.comments.push(newComment.id)
//
//                 return newComment
//             },
//
//             deleteComment(this: PostsInstanceType, commentId: string) {
//
//                 const isCommentExist: number = this.comments.indexOf(commentId)
//                 if (isCommentExist === -1) {
//                     throw new Error("Comment does not exist")
//                 }
//                 this.comments.splice(isCommentExist, 1)
//                 return true
//             },
//
//             updateLikeStatus(this: PostsInstanceType, userInfo: AccessTokenPayloadType, likeStatus: string) {
//
//                 if (likeStatus === "Like") {
//
//                     if (!this.likesInfo.likedBy.includes(userInfo.id)) {
//
//                         this.likesInfo.likedBy.push(userInfo.id)
//
//                         const index: number = this.likesInfo.dislikedBy.indexOf(userInfo.id)
//                         if (index > -1) {
//                             this.likesInfo.dislikedBy.splice(index, 1)
//                         }
//
//                         this.likesInfo.newestLikes.unshift({
//                             addedAt: new Date(),
//                             userId: userInfo.id,
//                             login: userInfo.login
//                         })
//
//                         if (this.likesInfo.newestLikes.length > 3) {
//                             this.likesInfo.newestLikes.pop()
//                         }
//
//                         return true
//                     }
//                     return true
//                 }
//
//                 if (likeStatus === "Dislike") {
//
//                     if (!this.likesInfo.dislikedBy.includes(userInfo.id)) {
//
//                         this.likesInfo.dislikedBy.push(userInfo.id)
//
//                         const index: number = this.likesInfo.likedBy.indexOf(userInfo.id)
//                         if (index > -1) {
//                             this.likesInfo.likedBy.splice(index, 1)
//                         }
//
//                         const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(like => like.userId === userInfo.id)
//                         if (isLikeNewest > -1) {
//                             this.likesInfo.newestLikes.splice(isLikeNewest, 1)
//                         }
//
//                         return true
//                     }
//                     return true
//                 }
//
//                 if (likeStatus === "None") {
//
//                     const likedByIndex: number = this.likesInfo.likedBy.indexOf(userInfo.id)
//                     if (likedByIndex > -1) {
//                         this.likesInfo.likedBy.splice(likedByIndex, 1)
//                     }
//
//                     const dislikedByIndex: number = this.likesInfo.dislikedBy.indexOf(userInfo.id)
//                     if (dislikedByIndex > -1) {
//                         this.likesInfo.dislikedBy.splice(dislikedByIndex, 1)
//                     }
//
//                     const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(like => like.userId === userInfo.id)
//                     if (isLikeNewest > -1) {
//                         this.likesInfo.newestLikes.splice(isLikeNewest, 1)
//                     }
//
//                     return true
//                 }
//                 return false
//             }
//         },
//         statics: {}
//     }
// )

export type PostDocumentType = HydratedDocument<Post>;
export type PostModelType = Model<PostDocumentType> & typeof Post;
export const PostSchema: MongooseSchema<Post> =
  SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
