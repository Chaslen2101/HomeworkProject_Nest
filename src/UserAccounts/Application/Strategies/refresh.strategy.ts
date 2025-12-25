import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { SessionSqlRepository } from '../../Infrastructure/Data-access/Sql/Repositories/session-sql.repository';
import { Session } from '../../Domain/session.entity';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';
import { RefreshTokenPayloadType } from '../../../Common/Types/auth-payloads.types';
import { hashHelper } from '../../Infrastructure/Security/hash.helper';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(SessionSqlRepository)
    private sessionRepository: SessionSqlRepository,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET as string,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.refreshToken,
      ]),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(
    req: Request,
    payload: RefreshTokenPayloadType,
  ): Promise<RefreshTokenPayloadType> {
    const refreshToken: string = req.cookies.refreshToken as string;

    const neededSession: Session | null =
      await this.sessionRepository.findByDeviceId(payload.deviceId);
    if (!neededSession) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const isValid: boolean = await hashHelper.compare(
      refreshToken,
      neededSession.refreshToken,
    );
    if (!isValid) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return payload;
  }
}
