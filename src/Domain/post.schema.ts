import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { CreatePostDTO } from '../Api/Input-dto/post.input-dto';
import { ObjectId } from 'mongodb';
import { DomainException } from './Exceptions/domain-exceptions';
import { UserPayloadDTO } from '../Api/Input-dto/auth.input-dto';
import { CommentDocumentType, CommentModelType } from './comment.schema';

@Schema({ _id: false })
class NewestLikes {
  @Prop({ type: MongooseSchema.Types.Date })
  addedAt: Date;

  @Prop({ type: String })
  userId: ObjectId;

  @Prop({ type: String })
  login: string;
}

@Schema({ _id: false })
class LikesInfo {
  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  likedBy: ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  dislikedBy: ObjectId[];

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

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  blogId: ObjectId;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  createdAt: Date;

  @Prop({ type: [ObjectId], required: true, default: [] })
  comments: ObjectId[];

  @Prop({ type: LikesInfo })
  likesInfo: LikesInfo;

  updatePost(
    this: PostDocumentType,
    newData: CreatePostDTO,
    blogId: ObjectId,
  ): boolean {
    this.title = newData.title;
    this.shortDescription = newData.shortDescription;
    this.content = newData.content;
    this.blogId = blogId;
    return true;
  }

  deleteComment(this: PostDocumentType, commentId: ObjectId): boolean {
    const isCommentExist: number = this.comments.indexOf(commentId);
    if (isCommentExist === -1) {
      throw new DomainException('Post dont have this comment', 404);
    }
    this.comments.splice(isCommentExist, 1);
    return true;
  }

  updateLikeStatus(
    this: PostDocumentType,
    user: UserPayloadDTO,
    likeStatus: string,
  ) {
    if (likeStatus === 'Like') {
      if (!this.likesInfo.likedBy.includes(user.sub)) {
        this.likesInfo.likedBy.push(user.sub);

        const index: number = this.likesInfo.dislikedBy.indexOf(user.sub);
        if (index > -1) {
          this.likesInfo.dislikedBy.splice(index, 1);
        }

        this.likesInfo.newestLikes.unshift({
          addedAt: new Date(),
          userId: user.sub,
          login: user.login,
        });

        if (this.likesInfo.newestLikes.length > 3) {
          this.likesInfo.newestLikes.pop();
        }

        return true;
      }
      return true;
    }

    if (likeStatus === 'Dislike') {
      if (!this.likesInfo.dislikedBy.includes(user.sub)) {
        this.likesInfo.dislikedBy.push(user.sub);

        const index: number = this.likesInfo.likedBy.indexOf(user.sub);
        if (index > -1) {
          this.likesInfo.likedBy.splice(index, 1);
        }

        const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(
          (like) => like.userId === user.sub,
        );
        if (isLikeNewest > -1) {
          this.likesInfo.newestLikes.splice(isLikeNewest, 1);
        }

        return true;
      }
      return true;
    }

    if (likeStatus === 'None') {
      const likedByIndex: number = this.likesInfo.likedBy.indexOf(user.sub);
      if (likedByIndex > -1) {
        this.likesInfo.likedBy.splice(likedByIndex, 1);
      }

      const dislikedByIndex: number = this.likesInfo.dislikedBy.indexOf(
        user.sub,
      );
      if (dislikedByIndex > -1) {
        this.likesInfo.dislikedBy.splice(dislikedByIndex, 1);
      }

      const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(
        (like) => like.userId === user.sub,
      );
      if (isLikeNewest > -1) {
        this.likesInfo.newestLikes.splice(isLikeNewest, 1);
      }

      return true;
    }
    return false;
  }

  createComment(
    this: PostDocumentType,
    content: string,
    user: UserPayloadDTO,
    CommentModel: CommentModelType,
  ) {
    const newComment: CommentDocumentType = new CommentModel({
      content: content,
      commentatorInfo: {
        userId: user.sub,
        userLogin: user.login,
      },
      createdAt: new Date(),
      postId: this.id,
      likesInfo: {
        likedBy: [],
        dislikedBy: [],
      },
    });
    this.comments.push(newComment._id);

    return newComment;
  }
}

export type PostDocumentType = HydratedDocument<Post>;
export type PostModelType = Model<PostDocumentType> & typeof Post;
export const PostSchema: MongooseSchema<Post> =
  SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
