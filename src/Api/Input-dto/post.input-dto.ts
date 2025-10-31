import { IsString, MaxLength } from 'class-validator';
import { Trim } from '../../Core/Decorators/Transform/trim';

export class PostInputType {
  @IsString()
  @MaxLength(30)
  @Trim()
  title: string;

  @IsString()
  @MaxLength(100)
  @Trim()
  shortDescription: string;

  @IsString()
  @MaxLength(1000)
  content: string;

  @IsString()
  blogId: string;
}
