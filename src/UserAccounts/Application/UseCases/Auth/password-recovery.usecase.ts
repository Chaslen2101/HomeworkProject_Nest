import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PasswordRecoveryInputDTO } from '../../../Api/InputDTOValidators/auth.input-dto.validator';
import { UserSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/user-sql.repository';
import { PasswordRecoveryInfo, User } from '../../../Domain/user.entity';
import { NotificationService } from '../../../../Notifications/Application/notification.service';

export class PasswordRecoveryCommand {
  constructor(public passwordRecoveryDTO: PasswordRecoveryInputDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
    @Inject(NotificationService)
    protected notificationService: NotificationService,
  ) {}

  async execute(dto: PasswordRecoveryCommand): Promise<void> {
    const neededUser: User | null =
      await this.userRepository.findUserByLoginOrEmail(
        dto.passwordRecoveryDTO.email,
      );
    if (!neededUser) {
      return;
    }

    const newPasswordRecoveryInfo: PasswordRecoveryInfo =
      PasswordRecoveryInfo.createNew(neededUser.id);
    await this.notificationService.passwordRecovery(
      dto.passwordRecoveryDTO.email,
      newPasswordRecoveryInfo.confirmationCode,
    );

    await this.userRepository.createPasswordRecoveryInfo(
      newPasswordRecoveryInfo,
    );

    return;
  }
}
