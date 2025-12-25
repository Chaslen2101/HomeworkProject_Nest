import {
  EmailConfirmationInfo,
  PasswordRecoveryInfo,
  User,
} from '../../Domain/user.entity';
import { UserTypeormEntity } from '../Data-access/Sql/Entities/user.typeorm-entity';
import { EmailConfirmInfoTypeormEntity } from '../Data-access/Sql/Entities/emailConfirmInfo.typeorm-entity';
import { Session } from '../../Domain/session.entity';
import { SessionTypeormEntity } from '../Data-access/Sql/Entities/session.typeorm-entity';
import { PasswordRecoveryInfoTypeormEntity } from '../Data-access/Sql/Entities/passwordRecoveryInfo.typeorm-entity';

export class UserAccountEntityMapper {
  static userToTypeormEntity(userDomain: User): UserTypeormEntity {
    const typeormEntity: UserTypeormEntity = new UserTypeormEntity();
    typeormEntity.id = userDomain.id;
    typeormEntity.email = userDomain.email;
    typeormEntity.password = userDomain.password;
    typeormEntity.createdAt = userDomain.createdAt;
    typeormEntity.login = userDomain.login;
    return typeormEntity;
  }

  static userToDomainEntity(userTypeorm: UserTypeormEntity): User {
    return new User(
      userTypeorm.id,
      userTypeorm.login,
      userTypeorm.email,
      userTypeorm.password,
      userTypeorm.createdAt,
    );
  }

  static emailConfirmInfoToTypeormEntity(
    emailConfirmInfoDomain: EmailConfirmationInfo,
  ): EmailConfirmInfoTypeormEntity {
    const typeormEntity: EmailConfirmInfoTypeormEntity =
      new EmailConfirmInfoTypeormEntity();
    typeormEntity.isConfirmed = emailConfirmInfoDomain.isConfirmed;
    typeormEntity.confirmationCode = emailConfirmInfoDomain.confirmationCode;
    typeormEntity.expirationDate = emailConfirmInfoDomain.expirationDate;
    typeormEntity.userId = emailConfirmInfoDomain.userId;
    return typeormEntity;
  }

  static emailConfirmInfoToDomainEntity(
    emailConfirmInfoTypeorm: EmailConfirmInfoTypeormEntity,
  ): EmailConfirmationInfo {
    return new EmailConfirmationInfo(
      emailConfirmInfoTypeorm.userId,
      emailConfirmInfoTypeorm.confirmationCode,
      emailConfirmInfoTypeorm.expirationDate,
      emailConfirmInfoTypeorm.isConfirmed,
    );
  }

  static sessionToTypeormEntity(sessionDomain: Session): SessionTypeormEntity {
    const typeormEntity: SessionTypeormEntity = new SessionTypeormEntity();
    typeormEntity.ip = sessionDomain.ip;
    typeormEntity.title = sessionDomain.title;
    typeormEntity.lastActiveDate = sessionDomain.lastActiveDate;
    typeormEntity.refreshToken = sessionDomain.refreshToken;
    typeormEntity.deviceId = sessionDomain.deviceId;
    typeormEntity.userId = sessionDomain.userId;
    return typeormEntity;
  }

  static sessionToDomainEntity(sessionTypeorm: SessionTypeormEntity): Session {
    return new Session(
      sessionTypeorm.userId,
      sessionTypeorm.ip,
      sessionTypeorm.title,
      sessionTypeorm.lastActiveDate,
      sessionTypeorm.deviceId,
      sessionTypeorm.refreshToken,
    );
  }

  static passwordRecoveryToTypeormEntity(
    passwordRecoveryDomain: PasswordRecoveryInfo,
  ): PasswordRecoveryInfoTypeormEntity {
    const typeormEntity: PasswordRecoveryInfoTypeormEntity =
      new PasswordRecoveryInfoTypeormEntity();
    typeormEntity.userId = passwordRecoveryDomain.userId;
    typeormEntity.confirmationCode = passwordRecoveryDomain.confirmationCode;
    typeormEntity.expirationDate = passwordRecoveryDomain.expirationDate;
    return typeormEntity;
  }

  static passwordRecoveryToDomainEntity(
    passwordRecoveryTypeorm: PasswordRecoveryInfoTypeormEntity,
  ): PasswordRecoveryInfo {
    return new PasswordRecoveryInfo(
      passwordRecoveryTypeorm.userId,
      passwordRecoveryTypeorm.confirmationCode,
      passwordRecoveryTypeorm.expirationDate,
    );
  }
}
