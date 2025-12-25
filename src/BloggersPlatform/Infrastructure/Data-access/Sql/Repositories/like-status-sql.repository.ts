import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LikeStatusTypeormEntity } from '../Entities/likeStatus.typeorm-entity';
import { LikeStatus } from '../../../../Domain/likeStatus.entity';
import { BloggerPlatformEntityMapper } from '../../../Mappers/blogger-platform-entity.mapper';

@Injectable()
export class LikeStatusSqlRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(LikeStatusTypeormEntity)
    protected likeStatusRepository: Repository<LikeStatusTypeormEntity>,
  ) {}

  async updateLikeStatus(likeStatus: LikeStatus): Promise<void> {
    const newTypeormEntity: LikeStatusTypeormEntity =
      BloggerPlatformEntityMapper.likeStatusToTypeormEntity(likeStatus);

    await this.likeStatusRepository.upsert(newTypeormEntity, [
      'userId',
      'entityId',
    ]);
    return;
  }

  async deleteLikeStatus(userId: string, entityId: string): Promise<boolean> {
    const result = await this.likeStatusRepository.delete({
      userId: userId,
      entityId: entityId,
    });
    return result.affected != 0;
  }
}
