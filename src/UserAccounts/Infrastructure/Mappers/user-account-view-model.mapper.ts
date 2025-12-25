import { UserTypeormEntity } from '../Data-access/Sql/Entities/user.typeorm-entity';
import { SessionTypeormEntity } from '../Data-access/Sql/Entities/session.typeorm-entity';
import {
  MyInfoType,
  SessionViewType,
  UserViewType,
} from '../../Api/Types/user-account.view-model.types';

export class MapToViewUserAccount {
  static mapUsers(users: UserTypeormEntity[]): UserViewType[] {
    return users.map((user: UserTypeormEntity) => {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });
  }

  static mapUser(userData: UserTypeormEntity): UserViewType {
    return {
      id: userData.id,
      login: userData.login,
      email: userData.email,
      createdAt: userData.createdAt,
    };
  }

  static mapMyInfo(userData: UserTypeormEntity): MyInfoType {
    return {
      email: userData.email,
      login: userData.login,
      userId: userData.id,
    };
  }

  static mapSessionsInfo(sessions: SessionTypeormEntity[]): SessionViewType[] {
    return sessions.map((sessionInfo: SessionTypeormEntity) => {
      return {
        deviceId: sessionInfo.deviceId,
        ip: sessionInfo.ip,
        lastActiveDate: sessionInfo.lastActiveDate,
        title: sessionInfo.title,
      };
    });
  }

  // mapSessionInfo(sessionInfo: SessionsInfoDBType): SessionsInfoViewType {
  //   return {
  //     ip: sessionInfo.ip,
  //     title: sessionInfo.title,
  //     lastActiveDate: sessionInfo.lastActiveDate,
  //     deviceId: sessionInfo.deviceId,
  //   };
  // },
}
