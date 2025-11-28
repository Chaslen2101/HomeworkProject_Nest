import { IsIn, IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';
import { Trim } from '../Validator/trim';

export class CreatePostDTO {
  @IsString()
  @MaxLength(30)
  @Trim()
  @IsNotEmpty()
  title: string;

  @IsString()
  @MaxLength(100)
  @Trim()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @MaxLength(1000)
  @Trim()
  @IsNotEmpty()
  content: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  blogId?: string;
}

export class UpdatePostLikeStatusDTO {
  @IsString()
  @IsIn(['None', 'Like', 'Dislike'])
  @Trim()
  likeStatus: string;
}

export class CreateCommentForPostDTO {
  @IsString()
  @Length(20, 300)
  @Trim()
  content: string;
}

export class UpdatePostDTO {
  @IsString()
  @MaxLength(30)
  @Trim()
  @IsNotEmpty()
  title: string;

  @IsString()
  @MaxLength(100)
  @Trim()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @MaxLength(1000)
  @Trim()
  @IsNotEmpty()
  content: string;
}
