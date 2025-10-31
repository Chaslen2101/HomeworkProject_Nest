import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Schema as MongooseSchema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { CreateUserInputDTO } from '../Api/Input-dto/user.input-dto';
import { DomainException } from './Exceptions/domain-exceptions';

@Schema()
class EmailConfirmationInfo {
  @Prop({ type: String, default: null })
  confirmationCode: string | null;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  expirationDate: Date | null;

  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;
}

@Schema()
class PasswordRecoveryInfo {
  @Prop({ type: String, default: null })
  confirmationCode: string | null;

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  expirationDate: Date | null;
}

@Schema()
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  createdAt: Date;

  @Prop({ type: EmailConfirmationInfo })
  emailConfirmationInfo: EmailConfirmationInfo;

  @Prop({ type: PasswordRecoveryInfo })
  passwordRecoveryInfo: PasswordRecoveryInfo;

  static createNewUser(
    this: UserModelType,
    user: CreateUserInputDTO,
    hashedPassword: string,
    confirmCode?: string,
  ): UserDocumentType {
    const confirmEmailCodeExpDate: Date = new Date();
    confirmEmailCodeExpDate.setDate(confirmEmailCodeExpDate.getDate() + 1);
    return new this({
      id: new ObjectId().toString(),
      login: user.login,
      email: user.email,
      password: hashedPassword,
      createdAt: new Date(),
      emailConfirmationInfo: {
        confirmationCode: confirmCode ? confirmCode : null,
        expirationDate: confirmCode ? confirmEmailCodeExpDate : null,
        isConfirmed: false,
      },
      passwordRecoveryInfo: {
        confirmationCode: null,
        expirationDate: null,
      },
    });
  }

  confirmEmail(code: string): boolean {
    if (!this.emailConfirmationInfo.expirationDate) {
      throw new DomainException('Invalid expiration date', 400, 'code');
    }
    const expirationDate: Date = new Date(
      this.emailConfirmationInfo.expirationDate,
    );
    if (expirationDate.getTime() - new Date().getTime() < 0) {
      throw new DomainException('Confirm code expired', 400, 'code');
    }
    if (this.emailConfirmationInfo.isConfirmed) {
      throw new DomainException('Your email is already confirmed', 400, 'code');
    }
    if (this.emailConfirmationInfo.confirmationCode !== code) {
      throw new DomainException('Invalid confirm code', 400, 'code');
    }
    this.emailConfirmationInfo.isConfirmed = true;
    return true;
  }

  changeEmailConfirmCode(code: string): boolean {
    this.emailConfirmationInfo.confirmationCode = code;
    return true;
  }

  setPasswordRecoveryCode(code: string): boolean {
    this.passwordRecoveryInfo.confirmationCode = code;
    this.passwordRecoveryInfo.expirationDate = new Date(
      new Date().setDate(new Date().getDate() + 1),
    );
    return true;
  }

  setNewPassword(recoveryCode: string, newPassword: string): boolean {
    if (this.passwordRecoveryInfo.confirmationCode !== recoveryCode) {
      throw new DomainException('Invalid recovery code', 400, 'code');
    }

    if (!this.passwordRecoveryInfo.expirationDate) {
      throw new DomainException('Invalid expiration date', 400, 'code');
    }

    if (
      this.passwordRecoveryInfo.expirationDate.getTime() -
        new Date().getTime() <
      0
    ) {
      throw new DomainException('Recovery code expired', 400, 'code');
    }

    this.password = newPassword;
    return true;
  }
}

export type UserDocumentType = HydratedDocument<User>;
export type UserModelType = Model<UserDocumentType> & typeof User;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
