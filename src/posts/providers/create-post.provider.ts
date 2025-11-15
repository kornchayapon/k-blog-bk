import { UsersService } from '@/users/providers/users.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { TagsService } from '@/tags/providers/tags.service';
import { CreatePostDto } from '../dtos/create-post-dto';
import { PostTypesService } from '@/post-types/providers/post-types.service';
import { CategoriesService } from '@/categories/providers/categories.service';
import { PicturesService } from '@/pictures/providers/pictures.service';

@Injectable()
export class CreatePostProvider {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,

    // Inject services
    private readonly postTypesService: PostTypesService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,

    private readonly picturesService: PicturesService,
    private readonly tagsService: TagsService,
  ) {}

  public async createPost(createPostDto: CreatePostDto, userId: number) {
    // Find Post Type, Category, Author, Must have ...
    const postType = await this.postTypesService.findOneById(
      createPostDto.postType,
    );

    if (!postType) {
      throw new NotFoundException(
        `Post type with id ${createPostDto.postType} not found`,
      );
    }

    // Find Category
    const category = await this.categoriesService.findOneById(
      createPostDto.category,
    );

    if (!category) {
      throw new NotFoundException(
        `User with id ${createPostDto.category} not found`,
      );
    }

    // Find Author
    const author = await this.usersService.findOneById(userId);

    if (!author) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Find tags, thumbnail, pictures Optional ...
    const tags = await this.tagsService.findMultipleTags(createPostDto.tags);
    const thumbnail = await this.picturesService.findOneById(
      createPostDto.thumbnail,
    );
    const pictures = await this.picturesService.findMultiPictures(
      createPostDto.pictures,
    );

    // Create Post entity
    const post = this.postsRepository.create({
      ...createPostDto,
      postType,
      category,
      tags,
      thumbnail,
      pictures,
      author,
    });

    try {
      // return the post
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Ensure your post valid fields',
      });
    }
  }
}
