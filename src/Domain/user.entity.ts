import { SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DomainException } from './Exceptions/domain-exceptions';
import { randomUUID } from 'node:crypto';
import { RegistrationInputDTO } from 'src/Api/Input-dto/auth.input-dto';

export class EmailConfirmationInfo {
  constructor(
    public userId: string,

    public confirmationCode: string,

    public expirationDate: Date,

    public isConfirmed: boolean,
  ) {}

  static createNew(userId: string): EmailConfirmationInfo {
    return new this(
      userId,
      randomUUID(),
      new Date(new Date().setDate(new Date().getDate() + 1)),
      false,
    );
  }

  confirmEmail(code: string): boolean {
    if (!this.expirationDate) {
      throw new DomainException('Invalid expiration date', 400, 'code');
    }
    if (this.expirationDate.getTime() - new Date().getTime() < 0) {
      throw new DomainException('Confirm code expired', 400, 'code');
    }
    if (this.isConfirmed) {
      throw new DomainException('Your email is already confirmed', 400, 'code');
    }
    if (this.confirmationCode !== code) {
      throw new DomainException('Invalid confirm code', 400, 'code');
    }
    this.isConfirmed = true;
    return true;
  }

  changeEmailConfirmCode(): boolean {
    if (this.isConfirmed) {
      throw new DomainException('Email is already confimed', 400, 'email');
    }
    this.confirmationCode = randomUUID();
    this.expirationDate = new Date(
      new Date().setDate(new Date().getDate() + 1),
    );
    return true;
  }
}

export class PasswordRecoveryInfo {
  constructor(
    public userId: string,

    public confirmationCode: string,

    public expirationDate: Date,
  ) {}

  static createNew(userId: string): PasswordRecoveryInfo {
    return new this(
      userId,
      randomUUID(),
      new Date(new Date().setDate(new Date().getDate() + 1)),
    );
  }

  setPasswordRecoveryCode(code: string): boolean {
    this.confirmationCode = code;
    this.expirationDate = new Date(
      new Date().setDate(new Date().getDate() + 1),
    );
    return true;
  }

  isCodeValid(): boolean {
    if (!this.expirationDate) {
      throw new DomainException('Invalid expiration date', 400, 'code');
    }

    if (this.expirationDate.getTime() - new Date().getTime() < 0) {
      throw new DomainException('Recovery code expired', 400, 'code');
    }
    return true;
  }
}

export class User {
  constructor(
    public id: string,

    public login: string,

    public email: string,

    public password: string,

    public createdAt: Date,
  ) {}

  static createNew(user: RegistrationInputDTO, hashedPassword: string): User {
    const confirmEmailCodeExpDate: Date = new Date();
    confirmEmailCodeExpDate.setDate(confirmEmailCodeExpDate.getDate() + 1);
    return new this(
      randomUUID(),
      user.login,
      user.email,
      hashedPassword,
      new Date(),
    );
  }

  setNewPassword(newPassword: string): boolean {
    this.password = newPassword;
    return true;
  }
}

export type UserDocumentType = HydratedDocument<User>;
export type UserModelType = Model<UserDocumentType> & typeof User;
export const UserEntity = SchemaFactory.createForClass(User);
UserEntity.loadClass(User);
