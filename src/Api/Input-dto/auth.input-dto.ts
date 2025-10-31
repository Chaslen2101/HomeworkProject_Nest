import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ObjectId } from 'mongodb';
import { Trim } from 'src/Core/Decorators/Transform/trim';

export class LoginInputDTO {
  @IsString()
  loginOrEmail: string;

  @IsString()
  password: string;
}

export class ConfirmEmailInputDTO {
  @IsString()
  code: string;
}

export class ResendConfirmCodeInputDTO {
  @IsString()
  @Matches(/^[\w-\\+.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class PasswordRecoveryInputDTO {
  @IsString()
  @Matches(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class RegistrationInputDTO {
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Trim()
  login: string;

  @IsString()
  @Length(6, 20)
  @Trim()
  password: string;

  @IsString()
  @Matches(/^[\w-\\+.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @Trim()
  email: string;
}

export class newPasswordInputDTO {
  @IsString()
  @Length(6, 20)
  @IsNotEmpty()
  @Trim()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  recoveryCode: string;
}

export class UserPayloadDTO {
  sub: ObjectId;
  login: string;
}
