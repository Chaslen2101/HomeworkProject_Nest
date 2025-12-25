import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../Common/Decorators/Validator/trim';

export class SetAnswerInputDTO {
  @IsNotEmpty()
  @Trim()
  @IsString()
  answer: string;
}
