import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  EmailConfirmationInfo,
  PasswordRecoveryInfo,
  User,
} from '../../../../Domain/user.entity';
import { UserTypeormEntity } from '../Entities/user.typeorm-entity';
import { EmailConfirmInfoTypeormEntity } from '../Entities/emailConfirmInfo.typeorm-entity';
import { PasswordRecoveryInfoTypeormEntity } from '../Entities/passwordRecoveryInfo.typeorm-entity';
import { SessionTypeormEntity } from '../Entities/session.typeorm-entity';
import { UserAccountEntityMapper } from '../../../Mappers/user-account-entity.mapper';

@Injectable()
export class UserSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserTypeormEntity)
    protected userRepository: Repository<UserTypeormEntity>,
    @InjectRepository(EmailConfirmInfoTypeormEntity)
    protected emailConfirmRepository: Repository<EmailConfirmInfoTypeormEntity>,
    @InjectRepository(PasswordRecoveryInfoTypeormEntity)
    protected passwordRecoveryRepository: Repository<PasswordRecoveryInfoTypeormEntity>,
    @InjectRepository(SessionTypeormEntity)
    protected sessionRepository: Repository<SessionTypeormEntity>,
  ) {}

  async deleteUser(userId: string): Promise<boolean> {
    await this.sessionRepository.delete({ userId: userId });
    await this.emailConfirmRepository.delete({ userId: userId });
    await this.passwordRecoveryRepository.delete({ userId: userId });
    const result = await this.userRepository.delete(userId);
    return result.affected != 0;
  }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const result: UserTypeormEntity | null =
      await this.userRepository.findOneBy([
        { login: loginOrEmail },
        { email: loginOrEmail },
      ]);
    if (!result) {
      return null;
    }

    return UserAccountEntityMapper.userToDomainEntity(result);
  }

  async findUserById(userId: string): Promise<User | null> {
    const result: UserTypeormEntity | null =
      await this.userRepository.findOneBy({
        id: userId,
      });
    if (!result) {
      return null;
    }

    return UserAccountEntityMapper.userToDomainEntity(result);
  }

  async createNewUser(
    newUser: User,
    emailConfirmInfo: EmailConfirmationInfo,
  ): Promise<string> {
    const userEntity: UserTypeormEntity =
      UserAccountEntityMapper.userToTypeormEntity(newUser);
    const EmailConfirmTypeormEntity: EmailConfirmInfoTypeormEntity =
      UserAccountEntityMapper.emailConfirmInfoToTypeormEntity(emailConfirmInfo);

    await this.userRepository.save(userEntity);
    await this.emailConfirmRepository.save(EmailConfirmTypeormEntity);

    return userEntity.id;
  }

  async findEmailConfirmInfoByCode(
    code: string,
  ): Promise<EmailConfirmationInfo | null> {
    const result: EmailConfirmInfoTypeormEntity | null =
      await this.emailConfirmRepository.findOneBy({
        confirmationCode: code,
      });
    if (!result) {
      return null;
    }
    return UserAccountEntityMapper.emailConfirmInfoToDomainEntity(result);
  }

  async findEmailConfirmInfoByUserId(
    userId: string,
  ): Promise<EmailConfirmationInfo | null> {
    const result: EmailConfirmInfoTypeormEntity | null =
      await this.emailConfirmRepository.findOneBy({
        userId: userId,
      });
    if (!result) {
      return null;
    }
    return UserAccountEntityMapper.emailConfirmInfoToDomainEntity(result);
  }

  async updateEmailConfirmInfo(
    emailConfirmInfo: EmailConfirmationInfo,
  ): Promise<boolean> {
    await this.emailConfirmRepository.update(
      { userId: emailConfirmInfo.userId },
      {
        confirmationCode: emailConfirmInfo.confirmationCode,
        expirationDate: emailConfirmInfo.expirationDate,
        isConfirmed: emailConfirmInfo.isConfirmed,
      },
    );
    return true;
  }

  async createPasswordRecoveryInfo(
    passwordRecoveryInfo: PasswordRecoveryInfo,
  ): Promise<void> {
    const passwordRecoveryTypeormEntity: PasswordRecoveryInfoTypeormEntity =
      UserAccountEntityMapper.passwordRecoveryToTypeormEntity(
        passwordRecoveryInfo,
      );
    await this.passwordRecoveryRepository.save(passwordRecoveryTypeormEntity);
    return;
  }

  async findPasswordRecoveryInfoByCode(
    code: string,
  ): Promise<PasswordRecoveryInfo | null> {
    const result: PasswordRecoveryInfoTypeormEntity | null =
      await this.passwordRecoveryRepository.findOneBy({
        confirmationCode: code,
      });
    if (!result) {
      return null;
    }

    return UserAccountEntityMapper.passwordRecoveryToDomainEntity(result);
  }

  async changePassword(newPassword: string, userId: string): Promise<boolean> {
    const result = await this.userRepository.update(
      { id: userId },
      { password: newPassword },
    );
    return result.affected != 0;
  }
}
