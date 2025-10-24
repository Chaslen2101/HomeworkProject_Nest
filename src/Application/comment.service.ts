// import { Inject, Injectable } from '@nestjs/common';
// import { CommentRepository } from '../Infrastructure/Repositories/comment.repository';
// import { PostRepository } from '../Infrastructure/Repositories/post.repository';
// import { UserViewType } from '../Types/Types';
// import { PostDocumentType } from '../Domain/post.schema';
// import { CommentDocumentType } from '../Domain/comment.schema';
//
// @Injectable()
// export class CommentService {
//   constructor(
//     @Inject(CommentRepository)
//     protected commentRepository: CommentRepository,
//     @Inject(PostRepository) protected postRepository: PostRepository,
//   ) {}
//
//   async createComment(
//     content: string,
//     userInfo: UserViewType,
//     postId: string,
//   ): Promise<string> {
//     const neededPost: PostDocumentType | null =
//       await this.postRepository.findById(postId);
//     if (!neededPost) {
//       throw new Error('Cant find needed post');
//     }
//
//     const newComment: CommentDocumentType = neededPost.createComment(
//       content,
//       userInfo,
//     );
//
//     await this.commentRepository.save(newComment);
//     await this.postRepository.save(neededPost);
//     return newComment.id;
//   }
//
//   async updateComment(
//     newCommentContent: string,
//     commentId: string,
//     userId: string,
//   ): Promise<boolean> {
//     const neededComment: CommentDocumentType | null =
//       await this.commentRepository.findById(commentId);
//     if (!neededComment) {
//       throw new Error('Cant find needed comment');
//     }
//     if (neededComment.commentatorInfo.userId !== userId) {
//       throw new Error('You cant update foreign comment');
//     }
//
//     neededComment.updateCommentContent(newCommentContent);
//
//     await this.commentRepository.save(neededComment);
//     return true;
//   }
//
//   async deleteComment(commentId: string, userId: string): Promise<boolean> {
//     const neededComment: CommentDocumentType | null =
//       await this.commentRepository.findById(commentId);
//     if (!neededComment) {
//       throw new Error('Cant find needed comment');
//     }
//     if (neededComment.commentatorInfo.userId !== userId) {
//       throw new Error('You cant delete foreign comment');
//     }
//
//     const neededPost: PostDocumentType | null =
//       await this.postRepository.findById(neededComment.postId);
//     if (!neededPost) {
//       throw new Error('Comment has invalid postId');
//     }
//     neededPost.deleteComment(commentId);
//
//     return this.commentRepository.deleteComment(commentId);
//   }
//
//   async updateLikeStatus(
//     commentId: string,
//     likeStatus: string,
//     userId: string,
//   ): Promise<boolean> {
//     const neededPost: CommentDocument | null =
//       await this.commentRepository.findById(commentId);
//     if (!neededPost) {
//       throw new Error('Cant find needed comment');
//     }
//
//     const isUpdated: boolean = neededPost.updateLikeStatus(likeStatus, userId);
//     if (!isUpdated) {
//       throw new Error('Invalid like status');
//     }
//
//     await this.commentRepository.save(neededPost);
//     return true;
//   }
// }
