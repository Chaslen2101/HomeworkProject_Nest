import { Inject, Injectable } from '@nestjs/common';
import { User } from '../Domain/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserSqlRepository } from '../Infrastructure/Data-access/Sql/Repositories/user-sql.repository';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
} from '../../Common/Types/auth-payloads.types';
import { TokenPairType } from './Types/auth.types';
import { hashHelper } from '../Infrastructure/Security/hash.helper';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
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
      { expiresIn: '20m' },
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
