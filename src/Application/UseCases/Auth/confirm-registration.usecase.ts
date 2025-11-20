import { ConfirmEmailInputDTO } from 'src/Api/Input-dto/auth.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailConfirmationInfo } from 'src/Domain/user.entity';
import { DomainException } from 'src/Domain/Exceptions/domain-exceptions';
import { Inject } from '@nestjs/common';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';

export class ConfirmRegistrationCommand {
  constructor(public confirmEmailInputDTO: ConfirmEmailInputDTO) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand, void>
{
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
  ) {}

  async execute(dto: ConfirmRegistrationCommand): Promise<void> {
    const emailConfirmInfo: EmailConfirmationInfo | null =
      await this.userRepository.findEmailConfirmInfoByCode(
        dto.confirmEmailInputDTO.code,
      );
    if (!emailConfirmInfo) {
      throw new DomainException('Invalid code', 400, 'code');
    }

    emailConfirmInfo.confirmEmail(dto.confirmEmailInputDTO.code);
    await this.userRepository.updateEmailConfirmInfo(emailConfirmInfo);
    return;
  }
}
