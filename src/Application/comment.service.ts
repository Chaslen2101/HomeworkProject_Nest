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
