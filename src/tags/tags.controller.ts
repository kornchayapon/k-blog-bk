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

import { TagsService } from './providers/tags.service';
import { CreateTagDto } from './dtos/create-tag.dto';
import { UpdateTagDto } from './dtos/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  public async createTag(@Body() createTagDto: CreateTagDto) {
    return await this.tagsService.createTag(createTagDto);
  }

  @Get()
  public async getAllTags() {
    return await this.tagsService.findAll();
  }

  @Get('/:id')
  public async getTag(@Param('id', ParseIntPipe) id: number) {
    return await this.tagsService.findOneById(id);
  }

  @Patch()
  public async updateTag(@Body() updateTagDto: UpdateTagDto) {
    return await this.tagsService.update(updateTagDto);
  }

  @Delete()
  public async softDeleteTag(@Query('id', ParseIntPipe) id: number) {
    await this.tagsService.softDelete(id);

    return {
      softDelete: true,
      id,
    };
  }

  @Post('delete')
  public async deleteTag(@Query('id', ParseIntPipe) id: number) {
    await this.tagsService.delete(id);

    return {
      delete: true,
      id,
    };
  }

  @Post('restore')
  public async restoreTag(@Query('id', ParseIntPipe) id: number) {
    await this.tagsService.restore(id);

    return {
      restore: true,
      id,
    };
  }
}
