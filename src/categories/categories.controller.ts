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
import { CategoriesService } from './providers/categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  public async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  public async getAllCategories() {
    return await this.categoriesService.findAll();
  }

  @Get('/:id')
  public async getCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.findOneById(id);
  }

  @Patch()
  public async updateCategory(@Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categoriesService.update(updateCategoryDto);
  }

  @Delete()
  public async softDeleteCategory(@Query('id', ParseIntPipe) id: number) {
    await this.categoriesService.softDelete(id);

    return {
      softDelete: true,
      id,
    };
  }

  @Post('delete')
  public async deleteCategory(@Query('id', ParseIntPipe) id: number) {
    await this.categoriesService.delete(id);

    return {
      delete: true,
      id,
    };
  }

  @Post('restore')
  public async restoreCategory(@Query('id', ParseIntPipe) id: number) {
    await this.categoriesService.restore(id);

    return {
      restore: true,
      id,
    };
  }
}
