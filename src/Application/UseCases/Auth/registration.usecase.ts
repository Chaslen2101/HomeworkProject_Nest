import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationInputDTO } from 'src/Api/Input-dto/auth.input-dto';
import { EmailConfirmationInfo, User } from 'src/Domain/user.entity';
import { DomainException } from 'src/Domain/Exceptions/domain-exceptions';
import { randomUUID } from 'node:crypto';
import { hashHelper } from 'src/Core/helper';
import { Inject } from '@nestjs/common';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';
import { EmailService } from 'src/Infrastructure/MailService/email.service';

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

    await this.userRepository.createNewUser(newUser, newEmailConfirmInfo);
    await this.emailService.sendEmailConfirmCode(
      dto.registrationInputDTO.email,
      newEmailConfirmInfo.confirmationCode,
    );
    return newUser.id;
  }
}
