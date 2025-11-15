import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post-dto';
import { CreatePostProvider } from './create-post.provider';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    private readonly createPostProvider: CreatePostProvider,

    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  public async createPost(createPostDto: CreatePostDto, userId: number) {
    return await this.createPostProvider.createPost(createPostDto, userId);
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
}
