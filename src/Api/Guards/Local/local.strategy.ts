import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../../Application/auth.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(username: string, password: string) {
    const userId: null | ObjectId = await this.authService.validateUser(
      username,
      password,
    );
    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  }
}
