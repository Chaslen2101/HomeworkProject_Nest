import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { randomUUID } from 'node:crypto';
import { UserSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/user-sql.repository';
import { SessionSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/session-sql.repository';
import { User } from '../../../Domain/user.entity';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';
import { Session } from '../../../Domain/session.entity';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
} from '../../../../Common/Types/auth-payloads.types';
import { TokenPairType } from '../../Types/auth.types';
import { hashHelper } from '../../../Infrastructure/Security/hash.helper';

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
    @Inject(UserSqlRepository) private userRepository: UserSqlRepository,
    @Inject(SessionSqlRepository)
    private sessionRepository: SessionSqlRepository,
    @Inject(AuthService) private authService: AuthService,
  ) {}

  async execute(dto: LoginCommand): Promise<TokenPairType> {
    const neededUser: User | null =
      await this.userRepository.findUserByLoginOrEmail(dto.user.login);

    if (!neededUser) {
      throw new DomainException('User not found', HttpStatus.NOT_FOUND);
    }

    const deviceId: string = randomUUID();

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

    const newSession: Session = Session.createNew(
      neededUser.id,
      dto.ip,
      dto.deviceName,
      deviceId,
      hashedRefreshToken,
    );

    await this.sessionRepository.createNewSession(newSession);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }
}
