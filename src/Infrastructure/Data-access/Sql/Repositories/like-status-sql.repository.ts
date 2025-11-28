import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AccessTokenPayloadType } from '../../../../Domain/Types/Types';

@Injectable()
export class LikeStatusSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updateLikeStatus(
    likeStatus: string,
    user: AccessTokenPayloadType,
    id: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
          INSERT INTO "like_status" (user_id, user_login, status, entity_id, added_at)
          VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT (user_id, entity_id)
          DO UPDATE SET
                status = $3
          WHERE "like_status".status != $3
          `,
      [user.sub, user.login, likeStatus, id, new Date()],
    );
    return;
  }

  async deleteLikeStatus(userId: string, id: string): Promise<void> {
    await this.dataSource.query(
      `
        DELETE FROM "like_status" 
        WHERE user_id = $1 AND entity_id = $2
        `,
      [userId, id],
    );
    return;
  }
}
