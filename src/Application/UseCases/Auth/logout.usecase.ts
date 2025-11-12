import { RefreshTokenPayloadType } from '../../../Types/Types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SessionRepository } from '../../../Infrastructure/Repositories/session.repository';

export class LogoutCommand {
  constructor(public refreshTokenPayload: RefreshTokenPayloadType) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(SessionRepository) private sessionRepository: SessionRepository,
  ) {}

  async execute(dto: LogoutCommand): Promise<void> {
    await this.sessionRepository.deleteSession(
      dto.refreshTokenPayload.deviceId,
    );

    return;
  }
}
