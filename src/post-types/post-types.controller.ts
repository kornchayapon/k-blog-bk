import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { PostTypesService } from './providers/post-types.service';

import { CreatePostTypeDto } from './dtos/create-post-type.dto';
import { UpdatePostTypeDto } from './dtos/update-post-type.dto';

@Controller('post-types')
export class PostTypesController {
  constructor(private readonly postTypesService: PostTypesService) {}

  @Post()
  public async createPostType(@Body() createPostTypeDto: CreatePostTypeDto) {
    return await this.postTypesService.createPostType(createPostTypeDto);
  }

  @Get()
  public async getAllPostTypes() {
    return await this.postTypesService.findAll();
  }

  @Get('/:id')
  public async getPostType(@Param('id', ParseIntPipe) id: number) {
    return await this.postTypesService.findOneById(id);
  }

  @Patch()
  public async updatePostType(@Body() updatePostTypeDto: UpdatePostTypeDto) {
    return await this.postTypesService.update(updatePostTypeDto);
  }

  @Delete()
  public async softDeletePostType(@Query('id', ParseIntPipe) id: number) {
    await this.postTypesService.softDelete(id);

    return {
      softDelete: true,
      id,
    };
  }

  @Post('delete')
  public async deletePostType(@Query('id', ParseIntPipe) id: number) {
    await this.postTypesService.delete(id);

    return {
      delete: true,
      id,
    };
  }

  @Post('restore')
  public async restorePostType(@Query('id', ParseIntPipe) id: number) {
    await this.postTypesService.restore(id);

    return {
      restore: true,
      id,
    };
  }
}
