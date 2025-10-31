import { IsString, Length, Matches } from 'class-validator';
import { ObjectId } from 'mongodb';

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
  @Matches(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/)
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
  login: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsString()
  @Matches(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class newPasswordInputDTO {
  @IsString()
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}

export class jwtPayloadDTO {
  sub: ObjectId;
}
