import { ResendConfirmCodeInputDTO } from 'src/Api/Input-dto/auth.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailConfirmationInfo, User } from 'src/Domain/user.entity';
import { DomainException } from 'src/Domain/Exceptions/domain-exceptions';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';
import { HttpStatus, Inject } from '@nestjs/common';
import { EmailService } from 'src/Infrastructure/MailService/email.service';

export class ResendEmailConfirmCommand {
  constructor(public resendConfirmCodeDTO: ResendConfirmCodeInputDTO) {}
}

@CommandHandler(ResendEmailConfirmCommand)
export class ResendEmailConfirmUseCase
  implements ICommandHandler<ResendEmailConfirmCommand>
{
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
    @Inject(EmailService) protected emailService: EmailService,
  ) {}

  async execute(dto: ResendEmailConfirmCommand): Promise<void> {
    const neededUser: User | null =
      await this.userRepository.findUserByLoginOrEmail(
        dto.resendConfirmCodeDTO.email,
      );
    if (!neededUser) {
      throw new DomainException(
        'User not found. Go register first',
        400,
        'email',
      );
    }
    const emailConfirmationInfo: EmailConfirmationInfo | null =
      await this.userRepository.findEmailConfirmInfoByUserId(neededUser.id);

    if (!emailConfirmationInfo) {
      throw new DomainException(
        'Email confirmation info not found',
        HttpStatus.NOT_FOUND,
      );
    }

    emailConfirmationInfo.changeEmailConfirmCode();
    await this.userRepository.updateEmailConfirmInfo(emailConfirmationInfo);
    await this.emailService.sendEmailConfirmCode(
      dto.resendConfirmCodeDTO.email,
      emailConfirmationInfo.confirmationCode,
    );
    return;
  }
}
