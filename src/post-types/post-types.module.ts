import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostTypesController } from './post-types.controller';
import { PostTypesService } from './providers/post-types.service';
import { PostType } from './post-type.entity';

@Module({
  controllers: [PostTypesController],
  providers: [PostTypesService],
  imports: [TypeOrmModule.forFeature([PostType])],
  exports: [PostTypesService],
})
export class PostTypesModule {}
