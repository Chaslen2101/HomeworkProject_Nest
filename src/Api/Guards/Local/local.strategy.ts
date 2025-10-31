import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../../Application/auth.service';
import { ObjectId } from 'mongodb';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { UserPayloadDTO } from '../../Input-dto/auth.input-dto';

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
  ): Promise<UserPayloadDTO> {
    const user: UserPayloadDTO | null = await this.authService.validateUser(
      loginOrEmail,
      password,
    );
    if (!user) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
