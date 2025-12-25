import { BasicStrategy as Strategy } from 'passport-http';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = (username: string, password: string): boolean => {
    if (username !== 'admin' || password !== 'qwerty') {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return true;
  };
}
