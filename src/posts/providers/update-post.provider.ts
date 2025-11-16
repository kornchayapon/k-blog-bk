import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { TagsService } from '@/tags/providers/tags.service';
import { PicturesService } from '@/pictures/providers/pictures.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../post.entity';
import { Repository } from 'typeorm';
import { PostTypesService } from '@/post-types/providers/post-types.service';
import { CategoriesService } from '@/categories/providers/categories.service';
import { UsersService } from '@/users/providers/users.service';

@Injectable()
export class UpdatePostProvider {
  constructor(
    // Inject Repository
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    // Inject services
    private readonly tagsService: TagsService,
    private readonly picturesService: PicturesService,

    private readonly postTypesService: PostTypesService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  public async update(updatePostDto: UpdatePostDto) {
    // Find tags, thumbnail, pictures Optional ...
    const tags = await this.tagsService.findMultiple(updatePostDto.tags);
    const thumbnail = await this.picturesService.findOneById(
      updatePostDto.thumbnail,
    );
    const pictures = await this.picturesService.findMultiple(
      updatePostDto.pictures,
    );

    const post = await this.postsRepository.findOneBy({
      id: updatePostDto.id,
    });

    if (!post) {
      throw new BadRequestException(
        `The post Id: ${updatePostDto.id} does not exist`,
      );
    }

    // Update Post properties
    post.title = updatePostDto.title ?? post.title;
    post.slug = updatePostDto.slug ?? post.slug;

    if (updatePostDto.postType) {
      const postType = await this.postTypesService.findOneById(
        updatePostDto.postType,
      );

      if (postType) post.postType = postType;
    }

    if (updatePostDto.category) {
      const category = await this.categoriesService.findOneById(
        updatePostDto.category,
      );

      if (category) post.category = category;
    }

    post.postStatus = updatePostDto.postStatus ?? post.postStatus;
    post.publishedOn = updatePostDto.publishedOn ?? post.publishedOn;

    if (updatePostDto.thumbnail && thumbnail) {
      post.thumbnail = thumbnail;
    }

    post.pictures = pictures;
    post.tags = tags;

    if (updatePostDto.author) {
      const author = await this.usersService.findOneById(updatePostDto.author);
      if (!author) {
        throw new NotFoundException(
          `User with id ${updatePostDto.author} not found`,
        );
      }

      post.author = author;
    }

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
