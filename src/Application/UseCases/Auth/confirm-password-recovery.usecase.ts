import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { newPasswordInputDTO } from 'src/Api/Input-dto/auth.input-dto';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';
import { HttpStatus, Inject } from '@nestjs/common';
import { PasswordRecoveryInfo, User } from 'src/Domain/user.entity';
import { DomainException } from 'src/Domain/Exceptions/domain-exceptions';
import { hashHelper } from 'src/Core/helper';

export class ConfirmPasswordRecoveryCommand {
  constructor(public confirmPasswordRecoveryDTO: newPasswordInputDTO) {}
}

@CommandHandler(ConfirmPasswordRecoveryCommand)
export class ConfirmPasswordRecoveryUseCase
  implements ICommandHandler<ConfirmPasswordRecoveryCommand>
{
  constructor(
    @Inject(UserSqlRepository) protected userRepository: UserSqlRepository,
  ) {}

  async execute(dto: ConfirmPasswordRecoveryCommand): Promise<void> {
    const neededInfo: PasswordRecoveryInfo | null =
      await this.userRepository.findPasswordRecoveryInfoByCode(
        dto.confirmPasswordRecoveryDTO.recoveryCode,
      );
    if (!neededInfo) {
      throw new DomainException('Invalid recovery code', 400, 'code');
    }

    neededInfo.isCodeValid();

    const neededUser: User | null = await this.userRepository.findUserById(
      neededInfo.userId,
    );

    if (!neededUser) {
      throw new DomainException('User not found', HttpStatus.NOT_FOUND);
    }

    const newHashedPassword: string = await hashHelper.hash(
      dto.confirmPasswordRecoveryDTO.newPassword,
    );

    neededUser.setNewPassword(newHashedPassword);

    return;
  }
}
