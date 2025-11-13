import { PartialType } from '@nestjs/swagger';
import { CreatePostTypeDto } from './create-post-type.dto';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePostTypeDto extends PartialType(CreatePostTypeDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  slug: string;
}
