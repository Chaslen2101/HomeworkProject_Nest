import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { SessionSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/session-sql.repository';
import { Session } from '../../../Domain/session.entity';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
} from '../../../../Common/Types/auth-payloads.types';
import { TokenPairType } from '../../Types/auth.types';
import { hashHelper } from '../../../Infrastructure/Security/hash.helper';

export class RefreshTokenCommand {
  constructor(public refreshTokenPayload: RefreshTokenPayloadType) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand, TokenPairType>
{
  constructor(
    @Inject(SessionSqlRepository)
    private sessionRepository: SessionSqlRepository,
    @Inject(AuthService) private authService: AuthService,
  ) {}

  async execute(dto: RefreshTokenCommand): Promise<TokenPairType> {
    const neededSession: Session | null =
      await this.sessionRepository.findByDeviceId(
        dto.refreshTokenPayload.deviceId,
      );

    if (!neededSession) {
      throw new DomainException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const accessTokenPayload: AccessTokenPayloadType = {
      sub: dto.refreshTokenPayload.sub,
      login: dto.refreshTokenPayload.login,
    };
    const tokenPair: TokenPairType = this.authService.tokenPairGen(
      accessTokenPayload,
      dto.refreshTokenPayload,
    );

    const hashedRefreshToken: string = await hashHelper.hash(
      tokenPair.refreshToken,
    );
    neededSession.updateRefreshToken(hashedRefreshToken);
    await this.sessionRepository.updateSession(neededSession);

    return tokenPair;
  }
}
