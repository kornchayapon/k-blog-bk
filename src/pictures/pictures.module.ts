import { Module } from '@nestjs/common';
import { PicturesController } from './pictures.controller';
import { PicturesService } from './providers/pictures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Picture } from './picture.entity';

@Module({
  controllers: [PicturesController],
  providers: [PicturesService],
  imports: [TypeOrmModule.forFeature([Picture])],
})
export class PicturesModule {}
