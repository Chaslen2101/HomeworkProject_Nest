import { RefreshTokenPayloadType } from '../../../Domain/Types/Types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { Session } from '../../../Domain/session.entity';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { SessionSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/session-sql.repository';

export class DeleteSessionCommand {
  constructor(
    public refreshTokenPayload: RefreshTokenPayloadType,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand, void>
{
  constructor(
    @Inject(SessionSqlRepository)
    protected sessionRepository: SessionSqlRepository,
  ) {}

  async execute(dto: DeleteSessionCommand): Promise<void> {
    const neededSession: Session | null =
      await this.sessionRepository.findByDeviceId(dto.deviceId);

    if (!neededSession) {
      throw new DomainException('No session found', HttpStatus.NOT_FOUND);
    }
    if (neededSession.userId !== dto.refreshTokenPayload.sub) {
      throw new DomainException('User ID does not match', HttpStatus.FORBIDDEN);
    }

    await this.sessionRepository.deleteSession(dto.deviceId);

    return;
  }
}
