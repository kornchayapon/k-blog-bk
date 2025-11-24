import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreatePostDto } from './dtos/create-post-dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { GetPostsDto } from './dtos/get-posts.dto';

import { PostsService } from './providers/posts.service';

import { Auth } from '@/auth/decorators/auth.decorator';
import { ActiveUser } from '@/auth/decorators/active-user.decorator';

import { AuthType } from '@/auth/enums/auth-type.enum';
import type { ActiveUserData } from '@/auth/interfaces/active-user-data.interface';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/enums/user.role.enum';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  public async create(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return await this.postsService.create(createPostDto, user);
  }

  @Get()
  @Auth(AuthType.None)
  public async getAll(@Query() postQuery: GetPostsDto) {
    return await this.postsService.findAll(postQuery);
  }

  @Get('/:id')
  public async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findOneById(id);
  }

  @Patch()
  public async update(
    @Body() updatePostDto: UpdatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return await this.postsService.update(updatePostDto, user);
  }

  @Delete()
  public async softDelete(@Query('id', ParseIntPipe) id: number) {
    await this.postsService.softDelete(id);

    return {
      softDelete: true,
      id,
    };
  }

  @Post('delete')
  public async delete(@Query('id', ParseIntPipe) id: number) {
    return await this.postsService.delete(id);

    // return {
    //   delete: true,
    //   id,
    // };
  }

  @Post('restore')
  public async restore(@Query('id', ParseIntPipe) id: number) {
    return await this.postsService.restore(id);

    return {
      restore: true,
      id,
    };
  }
}
