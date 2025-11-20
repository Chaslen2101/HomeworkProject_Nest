import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
  TokenPairType,
} from 'src/Types/Types';
import { User } from 'src/Domain/user.entity';
import { Session } from 'src/Domain/session.entity';
import { DomainException } from 'src/Domain/Exceptions/domain-exceptions';
import { hashHelper } from 'src/Core/helper';
import { AuthService } from '../../auth.service';
import { randomUUID } from 'node:crypto';
import { SessionSqlRepository } from 'src/Infrastructure/Repositories/SQL/session-sql.repository';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';

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
