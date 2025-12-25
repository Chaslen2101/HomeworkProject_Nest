import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Trim } from '../../../Common/Decorators/Validator/trim';

export class CreateUpdateQuestionInputDTO {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @Length(10, 500)
  body: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  correctAnswers: string[];
}

export class UpdatePublishStatusDTO {
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}
