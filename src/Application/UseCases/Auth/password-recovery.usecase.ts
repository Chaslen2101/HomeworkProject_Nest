import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInputDTO } from 'src/Api/Input-dto/auth.input-dto';
import { PasswordRecoveryInfo, User } from 'src/Domain/user.entity';
import { Inject } from '@nestjs/common';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';
import { EmailService } from 'src/Infrastructure/MailService/email.service';

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
