import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegistrationInputDTO } from '../../../Api/InputDTOValidators/auth.input-dto.validator';
import { UserSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/user-sql.repository';
import { EmailConfirmationInfo, User } from '../../../Domain/user.entity';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';
import { NotificationService } from '../../../../Notifications/Application/notification.service';
import { hashHelper } from '../../../Infrastructure/Security/hash.helper';

export class RegistrationCommand {
  constructor(public registrationInputDTO: RegistrationInputDTO) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand, any>
{
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
    @Inject(NotificationService)
    protected notificationService: NotificationService,
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
    await this.notificationService.registration(
      dto.registrationInputDTO.email,
      newEmailConfirmInfo.confirmationCode,
    );
    return newUser.id;
  }
}
