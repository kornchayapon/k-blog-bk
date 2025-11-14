import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../category.entity';

import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CreateCategoryDto } from '../dtos/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  // Create Category
  public async createCategory(createCategoryDto: CreateCategoryDto) {
    let category = await this.findOneBySlug(createCategoryDto.slug);

    if (category) {
      throw new BadRequestException('Slug already in use');
    }

    category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  // Find all Categories
  public async findAll() {
    let categories: Category[];

    try {
      categories = await this.categoriesRepository.find();
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connection to database',
        },
      );
    }

    return categories;
  }

  // Find Category by Id
  public async findOneById(id: number) {
    if (!id) return null;
    return await this.categoriesRepository.findOneBy({ id });
  }

  // Find Category by slug
  public async findOneBySlug(slug: string) {
    if (!slug) return null;
    return await this.categoriesRepository.findOneBy({ slug });
  }

  // Update Category
  public async update(updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOneBy({
      id: updateCategoryDto.id,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, updateCategoryDto);

    return await this.categoriesRepository.save(category);
  }

  // Soft delete Category
  public async softDelete(id: number) {
    const category = await this.findOneById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.categoriesRepository.softDelete(id);
  }

  // Delete Category
  public async delete(id: number) {
    const category = await this.findOneById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.categoriesRepository.delete(id);
  }

  // Restore Category
  public async restore(id: number) {
    return await this.categoriesRepository.restore(id);
  }
}
