// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PostDocumentType } from '../../../Domain/post.entity';
// import { PostRepository } from '../../../Infrastructure/Repositories/post.repository';
// import { HttpStatus, Inject } from '@nestjs/common';
// import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
// import { Comment, CommentDocumentType } from '../../../Domain/comment.schema';
// import type { CommentModelType } from '../../../Domain/comment.schema';
// import { InjectModel } from '@nestjs/mongoose';
// import { CreateCommentForPostDTO } from '../../../Api/Input-dto/post.input-dto';
// import { CommentRepository } from '../../../Infrastructure/Repositories/comment.repository';
// import { AccessTokenPayloadType } from '../../../Types/Types';
//
// export class CreateCommentForPostCommand {
//   constructor(
//     public postId: string,
//     public createCommentForPostDTO: CreateCommentForPostDTO,
//     public user: AccessTokenPayloadType,
//   ) {}
// }
//
// @CommandHandler(CreateCommentForPostCommand)
// export class CreateCommentForPostUseCase
//   implements ICommandHandler<CreateCommentForPostCommand, string>
// {
//   constructor(
//     @Inject(PostRepository) protected postRepository: PostRepository,
//     @InjectModel(Comment.name) protected commentModel: CommentModelType,
//     @Inject(CommentRepository) protected commentRepository: CommentRepository,
//   ) {}
//
//   async execute(dto: CreateCommentForPostCommand): Promise<string> {
//     const neededPost: PostDocumentType | null =
//       await this.postRepository.findById(dto.postId);
//     if (!neededPost) {
//       throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
//     }
//     const newComment: CommentDocumentType = neededPost.createComment(
//       dto.createCommentForPostDTO.content,
//       dto.user,
//       this.commentModel,
//     );
//
//     await this.commentRepository.save(newComment);
//     await this.postRepository.save(neededPost);
//     return newComment._id.toString();
//   }
// }
