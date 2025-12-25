import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import { AccessTokenPayloadType } from '../../Common/Types/auth-payloads.types';

@Injectable()
export class AuthExternalService {
  constructor(@Inject(JwtService) private jwtService: JwtService) {}
  async verify(token: string): Promise<AccessTokenPayloadType> {
    return await this.jwtService.verify(token);
  }
}
