import { Inject, Injectable } from '@nestjs/common';
import { hashHelper } from '../Infrastructure/Utils/helper';
import { User } from '../Domain/user.entity';
import { EmailService } from '../Infrastructure/MailService/email.service';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
  TokenPairType,
} from '../Domain/Types/Types';
import { UserSqlRepository } from '../Infrastructure/Data-access/Sql/Repositories/user-sql.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
    @Inject(EmailService) protected emailService: EmailService,
    @Inject(JwtService) protected jwtService: JwtService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<AccessTokenPayloadType | null> {
    const user: User | null =
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

    return { sub: user.id, login: user.login };
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
