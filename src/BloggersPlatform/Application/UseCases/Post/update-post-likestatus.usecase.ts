import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostLikeStatusDTO } from '../../../Api/InputDTOValidators/post-input-dto.validator';
import { HttpStatus, Inject } from '@nestjs/common';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';
import { LikeStatusSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/like-status-sql.repository';
import { PostSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/post-sql.repository';
import { Post } from '../../../Domain/post.entity';
import { LikeStatus } from '../../../Domain/likeStatus.entity';
import { AccessTokenPayloadType } from '../../../../Common/Types/auth-payloads.types';

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
    if (dto.updateLikeStatusDTO.likeStatus === 'None') {
      await this.likeStatusRepository.deleteLikeStatus(
        dto.user.sub,
        dto.postId,
      );
    }
    const newLikeStatus: LikeStatus = LikeStatus.createNew(
      dto.updateLikeStatusDTO.likeStatus,
      dto.user,
      dto.postId,
    );

    await this.likeStatusRepository.updateLikeStatus(newLikeStatus);

    return true;
  }
}
