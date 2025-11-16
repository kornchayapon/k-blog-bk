import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Tag } from '../tag.entity';
import { CreateTagDto } from '../dtos/create-tag.dto';
import { UpdateTagDto } from './../dtos/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  // Create Tag
  public async create(createTagDto: CreateTagDto) {
    let tag = await this.findOneBySlug(createTagDto.slug);

    if (tag) {
      throw new BadRequestException('Slug already in use');
    }

    tag = this.tagsRepository.create(createTagDto);
    return await this.tagsRepository.save(tag);
  }

  // Find all Tags
  public async findAll() {
    let tags: Tag[];

    try {
      tags = await this.tagsRepository.find();
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connection to database',
        },
      );
    }

    return tags;
  }

  // Find Tag by Id
  public async findOneById(id: number) {
    if (!id) return undefined;

    const tag = await this.tagsRepository.findOneBy({ id });
    return tag ?? undefined;
  }

  // Find Tag by slug
  public async findOneBySlug(slug: string) {
    if (!slug) return undefined;

    const tag = await this.tagsRepository.findOneBy({ slug });
    return tag ?? undefined;
  }

  // Find multiple Tags (service function)
  public async findMultiple(tags?: number[]) {
    if (!tags?.length) {
      return [];
    }

    const results = await this.tagsRepository.find({
      where: {
        id: In(tags),
      },
    });

    return results;
  }

  // Update Tag
  public async update(updateTagDto: UpdateTagDto) {
    const tag = await this.tagsRepository.findOneBy({
      id: updateTagDto.id,
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    Object.assign(tag, updateTagDto);

    return await this.tagsRepository.save(tag);
  }

  // Soft delete Tag
  public async softDelete(id: number) {
    const tag = await this.findOneById(id);

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return await this.tagsRepository.softDelete(id);
  }

  // Delete Tag
  public async delete(id: number) {
    const tag = await this.findOneById(id);

    if (!tag) {
      throw new NotFoundException('Category not found');
    }

    return await this.tagsRepository.delete(id);
  }

  // Restore Tag
  public async restore(id: number) {
    return await this.tagsRepository.restore(id);
  }
}
