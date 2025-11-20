import { RefreshTokenPayloadType } from '../../../Types/Types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import { SessionRepository } from '../../../Infrastructure/Repositories/session.repository';
import { SessionDocumentType } from '../../../Domain/session.entity';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';

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
    @Inject(SessionRepository) protected sessionRepository: SessionRepository,
  ) {}

  async execute(dto: DeleteSessionCommand): Promise<void> {
    const neededSession: SessionDocumentType | null =
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
