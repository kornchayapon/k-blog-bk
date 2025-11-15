import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post-dto';
import { CreatePostProvider } from './create-post.provider';

@Injectable()
export class PostsService {
  constructor(private readonly createPostProvider: CreatePostProvider) {}

  public async createPost(createPostDto: CreatePostDto, userId: number) {
    return await this.createPostProvider.createPost(createPostDto, userId);
  }
}
