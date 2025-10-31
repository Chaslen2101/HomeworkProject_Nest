import { BasicStrategy as Strategy } from 'passport-http';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }

  public validate = (username: string, password: string): boolean => {
    if ('admin' !== username || 'qwerty' !== password) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return true;
  };
}
