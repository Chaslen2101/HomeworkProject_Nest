// import { CommentRepository } from '../../../Infrastructure/Repositories/comment.repository';
// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { CommentDocumentType } from '../../../Domain/comment.schema';
// import { HttpStatus, Inject } from '@nestjs/common';
// import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
// import { PostDocumentType } from '../../../Domain/post.entity';
// import { PostRepository } from '../../../Infrastructure/Repositories/post.repository';
//
// import { AccessTokenPayloadType } from '../../../Types/Types';
//
// export class DeleteCommentCommand {
//   constructor(
//     public commentId: string,
//     public user: AccessTokenPayloadType,
//   ) {}
// }
//
// @CommandHandler(DeleteCommentCommand)
// export class DeleteCommentUseCase
//   implements ICommandHandler<DeleteCommentCommand, boolean>
// {
//   constructor(
//     @Inject(CommentRepository)
//     private readonly commentRepository: CommentRepository,
//     @Inject(PostRepository) private readonly postRepository: PostRepository,
//   ) {}
//
//   async execute(dto: DeleteCommentCommand): Promise<boolean> {
//     const neededComment: CommentDocumentType | null =
//       await this.commentRepository.findById(dto.commentId);
//     if (!neededComment) {
//       throw new DomainException('Comment not found', HttpStatus.NOT_FOUND);
//     }
//     if (
//       neededComment.commentatorInfo.userId.toString() !==
//       dto.user.sub.toString()
//     ) {
//       throw new DomainException(
//         'You cant delete not yours comment',
//         HttpStatus.FORBIDDEN,
//       );
//     }
//
//     const neededPost: PostDocumentType | null =
//       await this.postRepository.findById(neededComment.postId);
//     if (!neededPost) {
//       throw new DomainException('Cant find needed post', HttpStatus.NOT_FOUND);
//     }
//     neededPost.deleteComment(dto.commentId);
//     await this.postRepository.save(neededPost);
//     await this.commentRepository.deleteComment(dto.commentId);
//     return true;
//   }
// }
