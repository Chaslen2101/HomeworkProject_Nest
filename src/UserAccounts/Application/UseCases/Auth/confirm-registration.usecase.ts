import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConfirmEmailInputDTO } from '../../../Api/InputDTOValidators/auth.input-dto.validator';
import { UserSqlRepository } from '../../../Infrastructure/Data-access/Sql/Repositories/user-sql.repository';
import { EmailConfirmationInfo } from '../../../Domain/user.entity';
import { DomainException } from '../../../../Common/Domain/Exceptions/domain-exceptions';

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
