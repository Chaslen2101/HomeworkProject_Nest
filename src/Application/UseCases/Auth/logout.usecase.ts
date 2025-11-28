import { RefreshTokenPayloadType } from '../../../Domain/Types/Types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SessionSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/session-sql.repository';

export class LogoutCommand {
  constructor(public refreshTokenPayload: RefreshTokenPayloadType) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(SessionSqlRepository)
    private sessionRepository: SessionSqlRepository,
  ) {}

  async execute(dto: LogoutCommand): Promise<void> {
    await this.sessionRepository.deleteSession(
      dto.refreshTokenPayload.deviceId,
    );
    return;
  }
}
