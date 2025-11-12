import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus, Inject } from '@nestjs/common';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
  TokenPairType,
} from '../../../Types/Types';
import { UserRepository } from '../../../Infrastructure/Repositories/user.repository';
import { UserDocumentType } from '../../../Domain/user.schema';
import { Session, SessionDocumentType } from '../../../Domain/session.schema';
import type { SessionModelType } from '../../../Domain/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { SessionRepository } from '../../../Infrastructure/Repositories/session.repository';
import { ObjectId } from 'mongodb';
import { hashHelper } from '../../../Core/helper';
import { AuthService } from '../../auth.service';

export class LoginCommand {
  constructor(
    public user: AccessTokenPayloadType,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
  implements ICommandHandler<LoginCommand, TokenPairType>
{
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @InjectModel(Session.name) private sessionModel: SessionModelType,
    @Inject(SessionRepository) private sessionRepository: SessionRepository,
    @Inject(AuthService) private authService: AuthService,
  ) {}

  async execute(dto: LoginCommand): Promise<TokenPairType> {
    const neededUser: UserDocumentType | null =
      await this.userRepository.findUserByLoginOrEmail(dto.user.login);

    if (!neededUser) {
      throw new DomainException('User not found', HttpStatus.NOT_FOUND);
    }

    const deviceId: string = new ObjectId().toString();

    const refreshTokenPayload: RefreshTokenPayloadType = {
      sub: dto.user.sub,
      login: dto.user.login,
      deviceId: deviceId,
    };
    const tokenPair: TokenPairType = this.authService.tokenPairGen(
      dto.user,
      refreshTokenPayload,
    );

    const hashedRefreshToken: string = await hashHelper.hash(
      tokenPair.refreshToken,
    );

    const newSession: SessionDocumentType = neededUser.createNewSession(
      this.sessionModel,
      dto.ip,
      dto.deviceName,
      deviceId,
      hashedRefreshToken,
    );

    await this.sessionRepository.save(newSession);
    await this.userRepository.save(neededUser);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }
}
