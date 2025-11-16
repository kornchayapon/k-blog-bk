import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post-dto';
import { CreatePostProvider } from './create-post.provider';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePostDto } from '../dtos/update-post.dto';
import { UpdatePostProvider } from './update-post.provider';

@Injectable()
export class PostsService {
  constructor(
    private readonly createPostProvider: CreatePostProvider,
    private readonly updatePostProvider: UpdatePostProvider,

    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  public async create(createPostDto: CreatePostDto, userId: number) {
    return await this.createPostProvider.create(createPostDto, userId);
  }

  // Find all Posts
  public async findAll() {
    let posts: Post[];

    try {
      posts = await this.postsRepository.find();
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connection to database',
        },
      );
    }

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

    return await this.postsRepository.delete(id);
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
