import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../../Application/auth.service';
import { AccessTokenPayloadType } from '../../../Types/Types';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

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
