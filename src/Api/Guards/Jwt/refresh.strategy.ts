import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenPayloadType } from 'src/Types/Types';
import { DomainException } from 'src/Domain/Exceptions/domain-exceptions';
import { hashHelper } from 'src/Core/helper';
import { SessionSqlRepository } from 'src/Infrastructure/Repositories/SQL/session-sql.repository';
import { Session } from 'src/Domain/session.entity';

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
