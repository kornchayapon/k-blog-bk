import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post-dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
