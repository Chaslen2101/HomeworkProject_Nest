import { Injectable } from '@nestjs/common';
import { IsIn, IsString, Length } from 'class-validator';

export class CreateUpdateCommentInputDTO {
  @IsString()
  @Length(20, 300)
  content: string;
}

export class UpdateCommentLikeStatusDTO {
  @IsString()
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}
