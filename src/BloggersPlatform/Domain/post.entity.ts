import { UpdatePostDTO } from '../Api/InputDTOValidators/post-input-dto.validator';
import { CreatePostForBlogInputDTO } from '../Api/InputDTOValidators/blog-input-dto.validator';
import { randomUUID } from 'node:crypto';

export class Post {
  constructor(
    public id: string,

    public title: string,

    public shortDescription: string,

    public content: string,

    public blogId: string,

    public blogName: string,

    public createdAt: Date,
  ) {}

  static createNew(
    postData: CreatePostForBlogInputDTO,
    blogId: string,
    blogName: string,
  ): Post {
    return new this(
      randomUUID(),
      postData.title,
      postData.shortDescription,
      postData.content,
      blogId,
      blogName,
      new Date(),
    );
  }

  updatePost(newData: UpdatePostDTO): boolean {
    this.title = newData.title;
    this.shortDescription = newData.shortDescription;
    this.content = newData.content;
    return true;
  }

  // deleteComment(this: PostDocumentType, commentId: string): boolean {
  //   const isCommentExist: number = this.comments.indexOf(commentId);
  //   if (isCommentExist === -1) {
  //     throw new DomainException('Post dont have this comment', 404);
  //   }
  //   this.comments.splice(isCommentExist, 1);
  //   return true;
  // }
  //
  // updateLikeStatus(
  //   this: PostDocumentType,
  //   user: AccessTokenPayloadType,
  //   likeStatus: string,
  // ) {
  //   if (likeStatus === 'Like') {
  //     if (!this.likesInfo.likedBy.includes(user.sub)) {
  //       this.likesInfo.likedBy.push(user.sub);
  //
  //       const index: number = this.likesInfo.dislikedBy.indexOf(user.sub);
  //       if (index > -1) {
  //         this.likesInfo.dislikedBy.splice(index, 1);
  //       }
  //
  //       this.likesInfo.newestLikes.unshift({
  //         addedAt: new Date(),
  //         userId: user.sub,
  //         login: user.login,
  //       });
  //
  //       if (this.likesInfo.newestLikes.length > 3) {
  //         this.likesInfo.newestLikes.pop();
  //       }
  //
  //       return true;
  //     }
  //     return true;
  //   }
  //
  //   if (likeStatus === 'Dislike') {
  //     if (!this.likesInfo.dislikedBy.includes(user.sub)) {
  //       this.likesInfo.dislikedBy.push(user.sub);
  //
  //       const index: number = this.likesInfo.likedBy.indexOf(user.sub);
  //       if (index > -1) {
  //         this.likesInfo.likedBy.splice(index, 1);
  //       }
  //
  //       const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(
  //         (like) => like.userId === user.sub,
  //       );
  //       if (isLikeNewest > -1) {
  //         this.likesInfo.newestLikes.splice(isLikeNewest, 1);
  //       }
  //
  //       return true;
  //     }
  //     return true;
  //   }
  //
  //   if (likeStatus === 'None') {
  //     const likedByIndex: number = this.likesInfo.likedBy.indexOf(user.sub);
  //     if (likedByIndex > -1) {
  //       this.likesInfo.likedBy.splice(likedByIndex, 1);
  //     }
  //
  //     const dislikedByIndex: number = this.likesInfo.dislikedBy.indexOf(
  //       user.sub,
  //     );
  //     if (dislikedByIndex > -1) {
  //       this.likesInfo.dislikedBy.splice(dislikedByIndex, 1);
  //     }
  //
  //     const isLikeNewest: number = this.likesInfo.newestLikes.findIndex(
  //       (like): boolean => like.userId === user.sub,
  //     );
  //     if (isLikeNewest > -1) {
  //       this.likesInfo.newestLikes.splice(isLikeNewest, 1);
  //     }
  //
  //     return true;
  //   }
  //   return false;
  // }
  //
  // createComment(
  //   this: PostDocumentType,
  //   content: string,
  //   user: AccessTokenPayloadType,
  //   CommentModel: CommentModelType,
  // ): CommentDocumentType {
  //   const newComment: CommentDocumentType = new CommentModel({
  //     content: content,
  //     commentatorInfo: {
  //       userId: new Types.ObjectId(user.sub),
  //       userLogin: user.login,
  //     },
  //     createdAt: new Date(),
  //     postId: this._id,
  //     likesInfo: {
  //       likedBy: [],
  //       dislikedBy: [],
  //     },
  //   });
  //   this.comments.push(newComment._id.toString());
  //
  //   return newComment;
  // }
}
