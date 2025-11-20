import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post-dto';
import { CreatePostProvider } from './create-post.provider';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { UpdatePostProvider } from './update-post.provider';
import { PicturesService } from '@/pictures/providers/pictures.service';
import { PaginationProvider } from '@/common/pagination/providers/pagination.provider';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { Paginated } from '@/common/pagination/interfaces/paginated.interface';

@Injectable()
export class PostsService {
  constructor(
    private readonly createPostProvider: CreatePostProvider,
    private readonly updatePostProvider: UpdatePostProvider,
    private readonly paginationProvider: PaginationProvider,

    private readonly picturesService: PicturesService,

    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  public async create(createPostDto: CreatePostDto, userId: number) {
    return await this.createPostProvider.create(createPostDto, userId);
  }

  // Find all Posts
  public async findAll(postQuery: GetPostsDto): Promise<Paginated<Post>> {
    const limit = postQuery.limit ?? 2;
    const page = postQuery.page ?? 1;

    const posts = await this.paginationProvider.paginateQuery(
      {
        limit,
        page,
      },
      this.postsRepository,
    );

    return posts;
  }

  // Find Post by Id
  public async findOneById(id: number) {
    if (!id) return undefined;

    const post = await this.postsRepository.findOneBy({ id });
    return post ?? undefined;
  }

  // Update Post
  public async update(updatePostDto: UpdatePostDto) {
    return await this.updatePostProvider.update(updatePostDto);
  }

  // Delete Post
  public async delete(id: number) {
    const post = await this.findOneById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Get thumbnailId
    const thumbnailId = post.thumbnail?.id;
    if (!thumbnailId) {
      throw new NotFoundException('No pictures found with the provided IDs.');
    }

    // Delete Thumbnail
    try {
      await this.picturesService.deleteOne(thumbnailId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete a pictures. Total errors: ${error}`,
      );
    }

    const pictureIds = post.pictures?.map((picture) => picture.id);

    // Delete Thumbnail
    if (pictureIds?.length) {
      try {
        await this.picturesService.deleteMultiple(pictureIds);
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to delete all pictures. Total errors: ${error}`,
        );
      }
    }

    // Delete Post
    try {
      await this.postsRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete all post. Total errors: ${error}`,
      );
    }

    const result = {
      postId: id,
      thumbnailId,
      pictureIds,
      deleted: true,
    };

    return result;

    // return await this.postsRepository.delete(id);
  }

  // Soft delete Post
  public async softDelete(id: number) {
    const post = await this.findOneById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return await this.postsRepository.softDelete(id);
  }

  // Restore Post
  public async restore(id: number) {
    return await this.postsRepository.restore(id);
  }
}
