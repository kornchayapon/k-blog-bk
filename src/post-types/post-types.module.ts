import { Module } from '@nestjs/common';
import { PostTypesController } from './post-types.controller';
import { PostTypesService } from './providers/post-types.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostType } from './post-type.entity';

@Module({
  controllers: [PostTypesController],
  providers: [PostTypesService],
  imports: [TypeOrmModule.forFeature([PostType])],
})
export class PostTypesModule {}
