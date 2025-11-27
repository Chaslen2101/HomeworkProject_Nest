import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostLikeStatusDTO } from '../../../Api/Input-dto/post.input-dto';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { AccessTokenPayloadType } from '../../../Types/Types';
import { LikeStatusSqlRepository } from '../../../Infrastructure/Repositories/SQL/like-status-sql.repository';
import { PostSqlRepository } from '../../../Infrastructure/Repositories/SQL/post-sql.repository';
import { Post } from '../../../Domain/post.entity';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public updateLikeStatusDTO: UpdatePostLikeStatusDTO,
    public user: AccessTokenPayloadType,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    @Inject(LikeStatusSqlRepository)
    protected likeStatusRepository: LikeStatusSqlRepository,
    @Inject(PostSqlRepository) protected postRepository: PostSqlRepository,
  ) {}

  async execute(dto: UpdatePostLikeStatusCommand): Promise<boolean> {
    const neededPost: Post | null = await this.postRepository.findById(
      dto.postId,
    );
    if (!neededPost) {
      throw new DomainException('Post not found', HttpStatus.NOT_FOUND);
    }
    console.log(dto.updateLikeStatusDTO.likeStatus);
    if (dto.updateLikeStatusDTO.likeStatus === 'None') {
      await this.likeStatusRepository.deleteLikeStatus(
        dto.user.sub,
        dto.postId,
      );
    } else {
      await this.likeStatusRepository.updateLikeStatus(
        dto.updateLikeStatusDTO.likeStatus,
        dto.user,
        dto.postId,
      );
    }

    return true;
  }
}
