import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './providers/posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { UpdatePostProvider } from './providers/update-post.provider';
import { PostTypesModule } from '@/post-types/post-types.module';
import { CategoriesModule } from '@/categories/categories.module';
import { UsersModule } from '@/users/users.module';
import { PicturesModule } from '@/pictures/pictures.module';
import { TagsModule } from '@/tags/tags.module';
import { CreatePostProvider } from './providers/create-post.provider';

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
  ],
})
export class PostsModule {}
