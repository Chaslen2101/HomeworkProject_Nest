import { IsString, Matches, MaxLength } from 'class-validator';
import { Trim } from '../../Core/Decorators/Transform/trim';

export class CreateUpdateBlogInputDTO {
  @IsString()
  @MaxLength(15)
  @Trim()
  name: string;

  @IsString()
  @MaxLength(500)
  @Trim()
  description: string;

  @IsString()
  @MaxLength(100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  @Trim()
  websiteUrl: string;
}

export class CreatePostForBlogInputDTO {
  @IsString()
  @MaxLength(30)
  title: string;

  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @MaxLength(1000)
  content: string;
}
