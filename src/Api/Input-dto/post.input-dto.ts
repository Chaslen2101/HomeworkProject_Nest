import { IsIn, IsString, Length, MaxLength } from 'class-validator';
import { Trim } from '../../Core/Decorators/Transform/trim';

export class CreatePostDTO {
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

export class UpdatePostLikeStatusDTO {
  @IsString()
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}

export class CreateCommentForPostDTO {
  @IsString()
  @Length(20, 300)
  content: string;
}
