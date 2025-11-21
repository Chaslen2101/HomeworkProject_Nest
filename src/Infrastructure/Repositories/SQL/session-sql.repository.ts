import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Session } from '../../../Domain/session.entity';
import { RefreshTokenPayloadType, SessionViewType } from '../../../Types/Types';
import { mapToView } from '../../../Core/helper';

@Injectable()
export class SessionSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createNewSession(session: Session): Promise<string> {
    const result = await this.dataSource.query(
      `
                INSERT INTO session
                    (ip, title, last_active_date, refresh_token, device_id, user_id)
                VALUES($1, $2, $3, $4, $5, $6)
                RETURNING device_id
            `,
      [
        session.ip,
        session.title,
        session.lastActiveDate,
        session.refreshToken,
        session.deviceId,
        session.userId,
      ],
    );

    return result[0];
  }

  async findByDeviceId(deviceId: string): Promise<Session | null> {
    const result = await this.dataSource.query(
      `
          SELECT * 
          FROM session s
          WHERE s.device_id = $1
          `,
      [deviceId],
    );
    if (result.length === 0) {
      return null;
    }

    return new Session(
      result[0].user_id,
      result[0].ip,
      result[0].title,
      result[0].last_active_date,
      result[0].device_id,
      result[0].refresh_token,
    );
  }

  async updateSession(session: Session): Promise<boolean> {
    await this.dataSource.query(
      `
          UPDATE session
          SET last_active_date = $1, refresh_token = $2
          WHERE device_id = $3
          `,
      [session.lastActiveDate, session.refreshToken, session.deviceId],
    );
    return true;
  }

  async deleteSession(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        DELETE FROM session
        WHERE device_id = $1
        `,
      [deviceId],
    );
    return result[1] === 1;
  }

  async findAllMySessions(
    sessionsInfo: RefreshTokenPayloadType,
  ): Promise<SessionViewType[]> {
    const result = await this.dataSource.query(
      `
        SELECT *
        FROM "session"
        WHERE user_id = $1
        `,
      [sessionsInfo.sub],
    );

    return mapToView.mapSessionsInfo(result);
  }

  async deleteAllSessions(sessionsInfo: RefreshTokenPayloadType) {
    const result = await this.dataSource.query(
      `
        DELETE FROM "session"
        WHERE user_id = $1 AND device_id != $2
        `,
      [sessionsInfo.sub, sessionsInfo.deviceId],
    );
    return result[1] === 1;
  }
}
