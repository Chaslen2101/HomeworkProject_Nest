import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../Core/Decorators/Transform/trim';

export class CreateUserInputDTO {
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/, {})
  @Trim()
  login: string;

  @IsString()
  @Length(6, 20)
  @Trim()
  password: string;

  @IsString()
  @Matches(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @Trim()
  email: string;
}
