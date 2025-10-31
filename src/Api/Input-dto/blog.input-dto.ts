import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { Trim } from '../../Core/Decorators/Transform/trim';

export class CreateUpdateBlogInputDTO {
  @IsString()
  @MaxLength(15)
  @Trim()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(500)
  @Trim()
  @IsNotEmpty()
  description: string;

  @IsString()
  @MaxLength(100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  @Trim()
  @IsNotEmpty()
  websiteUrl: string;
}

export class CreatePostForBlogInputDTO {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  @Trim()
  title: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @Trim()
  shortDescription: string;

  @IsString()
  @MaxLength(1000)
  @IsNotEmpty()
  @Trim()
  content: string;
}
