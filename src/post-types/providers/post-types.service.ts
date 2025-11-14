import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostType } from '../post-type.entity';
import { Repository } from 'typeorm';
import { CreatePostTypeDto } from '../dtos/create-post-type.dto';
import { UpdatePostTypeDto } from '../dtos/update-post-type.dto';

@Injectable()
export class PostTypesService {
  constructor(
    @InjectRepository(PostType)
    private postTypesRepository: Repository<PostType>,
  ) {}

  // Create PostType
  public async createPostType(createPostTypeDto: CreatePostTypeDto) {
    let postType = await this.findOneBySlug(createPostTypeDto.slug);
    if (postType) {
      throw new BadRequestException('Slug already in use');
    }

    postType = this.postTypesRepository.create(createPostTypeDto);
    return await this.postTypesRepository.save(postType);
  }

  // Find all PostType
  public async findAll() {
    let postTypes: PostType[];

    try {
      postTypes = await this.postTypesRepository.find();
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connection to database',
        },
      );
    }

    return postTypes;
  }

  // Find PostType by Id
  public async findOneById(id: number) {
    if (!id) return null;
    return await this.postTypesRepository.findOneBy({ id });
  }

  // Find PostType by slug
  public async findOneBySlug(slug: string) {
    if (!slug) return null;
    return await this.postTypesRepository.findOneBy({ slug });
  }

  // Update PostType
  public async update(updatePostTypeDto: UpdatePostTypeDto) {
    const postType = await this.postTypesRepository.findOneBy({
      id: updatePostTypeDto.id,
    });

    if (!postType) {
      throw new NotFoundException('Post type not found');
    }

    Object.assign(postType, updatePostTypeDto);

    return await this.postTypesRepository.save(postType);
  }

  // Soft delete PostType
  public async softDelete(id: number) {
    const postType = await this.postTypesRepository.findOneBy({ id });

    if (!postType) {
      throw new NotFoundException('Post type not found');
    }

    return await this.postTypesRepository.softDelete(id);
  }

  // Delete PostType
  public async delete(id: number) {
    const postType = await this.postTypesRepository.findOneBy({ id });

    if (!postType) {
      throw new NotFoundException('Post type not found');
    }

    return await this.postTypesRepository.delete(id);
  }

  // Restore PostType
  public async restore(id: number) {
    return await this.postTypesRepository.restore(id);
  }
}
