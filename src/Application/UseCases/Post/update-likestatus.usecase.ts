import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostLikeStatusDTO } from '../../../Api/Input-dto/post.input-dto';
import { ObjectId } from 'mongodb';
import { PostDocumentType } from '../../../Domain/post.schema';
import { PostRepository } from '../../../Infrastructure/Repositories/post.repository';
import { HttpStatus, Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { UserPayloadDTO } from '../../../Api/Input-dto/auth.input-dto';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public updateLikeStatusDTO: UpdatePostLikeStatusDTO,
    public user: UserPayloadDTO,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    @Inject(PostRepository) protected postRepository: PostRepository,
  ) {}

  async execute(dto: UpdatePostLikeStatusCommand): Promise<boolean> {
    const neededPost: PostDocumentType | null =
      await this.postRepository.findById(dto.postId);
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }

    const isLikeStatusUpdated: boolean = neededPost.updateLikeStatus(
      dto.user,
      dto.updateLikeStatusDTO.likeStatus,
    );
    if (!isLikeStatusUpdated) {
      throw new DomainException('Invalid like status', HttpStatus.FORBIDDEN);
    }

    await this.postRepository.save(neededPost);

    return true;
  }
}
