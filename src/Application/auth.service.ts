import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { hashHelper } from '../Core/helper';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocumentType } from '../Domain/user.schema';
import type { UserModelType } from '../Domain/user.schema';
import { UserRepository } from '../Infrastructure/Repositories/user.repository';
import { DomainException } from '../Domain/Exceptions/domain-exceptions';
import { EmailService } from '../Infrastructure/MailService/email.service';
import { ObjectId } from 'mongodb';
import { JwtService } from '@nestjs/jwt';
import {
  newPasswordInputDTO,
  RegistrationInputDTO,
} from '../Api/Input-dto/auth.input-dto';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
  TokenPairType,
} from '../Types/Types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) protected UserModel: UserModelType,
    @Inject(UserRepository) protected userRepository: UserRepository,
    @Inject(EmailService) protected emailService: EmailService,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}
  async registration(newUserData: RegistrationInputDTO) {
    const isEmailUniq: UserDocumentType | null =
      await this.userRepository.findUserByLoginOrEmail(newUserData.email);
    if (isEmailUniq) {
      throw new DomainException('Email should be uniq', 400, 'email');
    }

    const isLoginUniq: UserDocumentType | null =
      await this.userRepository.findUserByLoginOrEmail(newUserData.login);
    if (isLoginUniq) {
      throw new DomainException('Login should be uniq', 400, 'login');
    }

    const confirmationCode: string = randomUUID().toString();

    const hashedPassword: string = await hashHelper.hash(newUserData.password);
    const newUser: UserDocumentType = this.UserModel.createNewUser(
      newUserData,
      hashedPassword,
      confirmationCode,
    );
    await this.userRepository.save(newUser);

    await this.emailService.sendEmailConfirmCode(
      newUserData.email,
      confirmationCode,
    );
    return true;
  }

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<AccessTokenPayloadType | null> {
    const user: UserDocumentType | null =
      await this.userRepository.findUserByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
    }
    const isPasswordCorrect: boolean = await hashHelper.compare(
      password,
      user.password,
    );
    if (!isPasswordCorrect) {
      return null;
    }

    return { sub: user._id.toString(), login: user.login };
  }

  async confirmEmail(code: string): Promise<void> {
    const neededUser: UserDocumentType | null =
      await this.userRepository.findUserByEmailConfirmCode(code);
    if (!neededUser) {
      throw new DomainException('Invalid code', 400, 'code');
    }

    neededUser.confirmEmail(code);
    await this.userRepository.save(neededUser);
    return;
  }

  async resendConfirmCode(email: string): Promise<boolean> {
    const neededUser: UserDocumentType | null =
      await this.userRepository.findUserByLoginOrEmail(email);
    if (!neededUser) {
      throw new DomainException(
        'User not found. Go register first',
        400,
        'email',
      );
    }
    const code: string = randomUUID().toString();
    await this.emailService.sendEmailConfirmCode(email, code);

    neededUser.changeEmailConfirmCode(code);
    await this.userRepository.save(neededUser);
    return true;
  }

  async passwordRecovery(email: string): Promise<boolean> {
    const neededUser: UserDocumentType | null =
      await this.userRepository.findUserByLoginOrEmail(email);
    if (!neededUser) {
      return true;
    }

    const recoveryCode: string = randomUUID().toString();
    await this.emailService.sendPasswordRecoveryEmail(email, recoveryCode);

    neededUser.setPasswordRecoveryCode(recoveryCode);
    await this.userRepository.save(neededUser);

    return true;
  }

  async setNewPassword(newPasswordDTO: newPasswordInputDTO): Promise<boolean> {
    const neededUser: UserDocumentType | null =
      await this.userRepository.findUserByEmailConfirmCode(
        newPasswordDTO.newPassword,
      );
    if (!neededUser) {
      throw new DomainException('Invalid recovery code', 400, 'newPassword');
    }

    const newHashedPassword: string = await hashHelper.hash(
      newPasswordDTO.newPassword,
    );
    neededUser.setNewPassword(newPasswordDTO.recoveryCode, newHashedPassword);

    return true;
  }

  tokenPairGen(
    accessTokenPayload: AccessTokenPayloadType,
    refreshTokenPayload: RefreshTokenPayloadType,
  ): TokenPairType {
    const accessToken: string = this.jwtService.sign({
      sub: accessTokenPayload.sub,
      login: accessTokenPayload.login,
    });

    const refreshToken: string = this.jwtService.sign(
      {
        sub: refreshTokenPayload.sub,
        login: refreshTokenPayload.login,
        deviceId: refreshTokenPayload.deviceId,
      },
      { expiresIn: '20s' },
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
