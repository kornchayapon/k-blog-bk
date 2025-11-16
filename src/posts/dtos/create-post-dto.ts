import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostStatus } from '../enums/post-status.enum';

export class CreatePostDto {
  @IsString()
  @MinLength(4)
  @MaxLength(512)
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'A slug should be all small letters and uses only "-" and without spaces. For example "my-url"',
  })
  slug: string;

  @IsInt()
  @IsNotEmpty()
  postType: number;

  @IsInt()
  @IsNotEmpty()
  category: number;

  @IsString()
  @IsOptional()
  content: string;

  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  tags?: number[];

  @IsInt()
  @IsOptional()
  thumbnail?: number;

  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  pictures?: number[];

  @IsEnum(PostStatus)
  @IsNotEmpty()
  postStatus: PostStatus;

  @IsOptional()
  publishedOn?: Date;

  @IsInt()
  @IsNotEmpty()
  author: number;
}
