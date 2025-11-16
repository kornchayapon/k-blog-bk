import { PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { CreatePostDto } from './create-post-dto';
import { PostStatus } from '../enums/post-status.enum';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'A slug should be all small letters and uses only "-" and without spaces. For example "my-url"',
  })
  slug?: string | undefined;

  @IsInt()
  @IsOptional()
  postType?: number | undefined;

  @IsInt()
  @IsOptional()
  category?: number | undefined;

  @IsEnum(PostStatus)
  @IsOptional()
  postStatus?: PostStatus | undefined;
}
