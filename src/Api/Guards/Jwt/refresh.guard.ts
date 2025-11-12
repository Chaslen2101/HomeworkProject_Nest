import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err, user) {
    if (err || !user) {
      throw new DomainException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
