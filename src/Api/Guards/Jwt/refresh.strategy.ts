import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenPayloadType } from '../../../Types/Types';
import { SessionRepository } from '../../../Infrastructure/Repositories/session.repository';
import { SessionDocumentType } from '../../../Domain/session.schema';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { hashHelper } from '../../../Core/helper';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(SessionRepository) private sessionRepository: SessionRepository,
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
    console.log('Recived cookie:', refreshToken);
    const neededSession: SessionDocumentType | null =
      await this.sessionRepository.findByDeviceId(payload.deviceId);
    if (!neededSession) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const isValid: boolean = await hashHelper.compare(
      neededSession.refreshToken,
      refreshToken,
    );
    if (!isValid) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return payload;
  }
}
