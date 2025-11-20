import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';

import { PostsService } from './providers/posts.service';
import { PostsController } from './posts.controller';

import { UpdatePostProvider } from './providers/update-post.provider';
import { CreatePostProvider } from './providers/create-post.provider';

import { UsersModule } from '@/users/users.module';
import { TagsModule } from '@/tags/tags.module';
import { PicturesModule } from '@/pictures/pictures.module';
import { PostTypesModule } from '@/post-types/post-types.module';
import { CategoriesModule } from '@/categories/categories.module';
import { PaginationModule } from '@/common/pagination/pagination.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService, CreatePostProvider, UpdatePostProvider],
  imports: [
    TypeOrmModule.forFeature([Post]),
    PostTypesModule,
    CategoriesModule,
    UsersModule,
    PicturesModule,
    TagsModule,
    PaginationModule,
  ],
})
export class PostsModule {}
