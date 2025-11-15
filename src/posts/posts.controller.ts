import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post-dto';
import { PostsService } from './providers/posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  public async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.createPost(
      createPostDto,
      createPostDto.author,
    );
  }

  @Get()
  public async getPosts() {
    return await this.postsService.findAll();
  }

  @Get('/:id')
  public async getPost(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOneById(id);
  }
}
