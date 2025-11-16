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
  public async create(@Body() createPostTypeDto: CreatePostTypeDto) {
    return await this.postTypesService.create(createPostTypeDto);
  }

  @Get()
  public async getAll() {
    return await this.postTypesService.findAll();
  }

  @Get('/:id')
  public async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.postTypesService.findOneById(id);
  }

  @Patch()
  public async update(@Body() updatePostTypeDto: UpdatePostTypeDto) {
    return await this.postTypesService.update(updatePostTypeDto);
  }

  @Delete()
  public async softDelete(@Query('id', ParseIntPipe) id: number) {
    await this.postTypesService.softDelete(id);

    return {
      softDelete: true,
      id,
    };
  }

  @Post('delete')
  public async delete(@Query('id', ParseIntPipe) id: number) {
    await this.postTypesService.delete(id);

    return {
      delete: true,
      id,
    };
  }

  @Post('restore')
  public async restore(@Query('id', ParseIntPipe) id: number) {
    await this.postTypesService.restore(id);

    return {
      restore: true,
      id,
    };
  }
}
