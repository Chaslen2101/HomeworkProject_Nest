import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegistrationInputDTO } from '../../../Api/Input-dto/auth.input-dto';
import { UserSqlRepository } from '../../../Infrastructure/Repositories/SQL/user-sql.repository';
import { EmailService } from '../../../Infrastructure/MailService/email.service';
import { EmailConfirmationInfo, User } from '../../../Domain/user.entity';
import { DomainException } from '../../../Domain/Exceptions/domain-exceptions';
import { hashHelper } from '../../../Core/helper';

export class RegistrationCommand {
  constructor(public registrationInputDTO: RegistrationInputDTO) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand, any>
{
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
    @Inject(EmailService) protected emailService: EmailService,
  ) {}

  async execute(dto: RegistrationCommand): Promise<any> {
    const isEmailUniq: User | null =
      await this.userRepository.findUserByLoginOrEmail(
        dto.registrationInputDTO.email,
      );
    if (isEmailUniq) {
      throw new DomainException('Email should be uniq', 400, 'email');
    }

    const isLoginUniq: User | null =
      await this.userRepository.findUserByLoginOrEmail(
        dto.registrationInputDTO.login,
      );
    if (isLoginUniq) {
      throw new DomainException('Login should be uniq', 400, 'login');
    }

    const hashedPassword: string = await hashHelper.hash(
      dto.registrationInputDTO.password,
    );
    const newUser: User = User.createNew(
      dto.registrationInputDTO,
      hashedPassword,
    );

    const newEmailConfirmInfo: EmailConfirmationInfo =
      EmailConfirmationInfo.createNew(newUser.id);
    console.log(newEmailConfirmInfo.confirmationCode);
    await this.userRepository.createNewUser(newUser, newEmailConfirmInfo);
    await this.emailService.sendEmailConfirmCode(
      dto.registrationInputDTO.email,
      newEmailConfirmInfo.confirmationCode,
    );
    return newUser.id;
  }
}
