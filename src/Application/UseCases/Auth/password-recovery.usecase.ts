import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PasswordRecoveryInputDTO } from '../../../Api/Input-dto/auth.input-dto';
import { UserSqlRepository } from '../../../Infrastructure/Repositories/SQL/user-sql.repository';
import { EmailService } from '../../../Infrastructure/MailService/email.service';
import { PasswordRecoveryInfo, User } from '../../../Domain/user.entity';

export class PasswordRecoveryCommand {
  constructor(public passwordRecoveryDTO: PasswordRecoveryInputDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
    @Inject(EmailService) protected emailService: EmailService,
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
    await this.emailService.sendPasswordRecoveryEmail(
      dto.passwordRecoveryDTO.email,
      newPasswordRecoveryInfo.confirmationCode,
    );

    await this.userRepository.createPasswordRecoveryInfo(
      newPasswordRecoveryInfo,
    );

    return;
  }
}
