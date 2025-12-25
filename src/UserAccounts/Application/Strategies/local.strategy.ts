import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';
import { AccessTokenPayloadType } from '../../../Common/Types/auth-payloads.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<AccessTokenPayloadType> {
    const user: AccessTokenPayloadType | null =
      await this.authService.validateUser(loginOrEmail, password);
    if (!user) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
