import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Session } from '../../../../Domain/session.entity';
import { SessionTypeormEntity } from '../Entities/session.typeorm-entity';
import { SessionViewType } from '../../../../Api/Types/user-account.view-model.types';
import { RefreshTokenPayloadType } from '../../../../../Common/Types/auth-payloads.types';
import { UserAccountEntityMapper } from '../../../Mappers/user-account-entity.mapper';
import { MapToViewUserAccount } from '../../../Mappers/user-account-view-model.mapper';

@Injectable()
export class SessionSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(SessionTypeormEntity)
    protected sessionRepository: Repository<SessionTypeormEntity>,
  ) {}

  async createNewSession(session: Session): Promise<string> {
    const sessionTypeormEntity: SessionTypeormEntity =
      UserAccountEntityMapper.sessionToTypeormEntity(session);
    const result: SessionTypeormEntity =
      await this.sessionRepository.save(sessionTypeormEntity);
    return result.deviceId;
  }

  async findByDeviceId(deviceId: string): Promise<Session | null> {
    const result: SessionTypeormEntity | null =
      await this.sessionRepository.findOneBy({
        deviceId: deviceId,
      });
    if (!result) {
      return null;
    }
    return UserAccountEntityMapper.sessionToDomainEntity(result);
  }

  async updateSession(session: Session): Promise<boolean> {
    const result = await this.sessionRepository.update(
      { deviceId: session.deviceId },
      {
        lastActiveDate: session.lastActiveDate,
        refreshToken: session.refreshToken,
      },
    );
    return result.affected != 0;
  }

  async deleteSession(deviceId: string): Promise<boolean> {
    const result = await this.sessionRepository.delete({ deviceId: deviceId });
    return result.affected != 0;
  }

  async findAllMySessions(
    sessionInfo: RefreshTokenPayloadType,
  ): Promise<SessionViewType[] | null> {
    const result: SessionTypeormEntity[] | null =
      await this.sessionRepository.findBy({
        userId: sessionInfo.sub,
      });
    if (!result) {
      return null;
    }
    return MapToViewUserAccount.mapSessionsInfo(result);
  }

  async deleteAllSessions(
    sessionsInfo: RefreshTokenPayloadType,
  ): Promise<boolean> {
    const result = await this.sessionRepository.delete({
      userId: sessionsInfo.sub,
      deviceId: Not(sessionsInfo.deviceId),
    });
    return result.affected != 0;
  }
}
