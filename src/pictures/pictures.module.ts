import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PicturesController } from './pictures.controller';
import { PicturesService } from './providers/pictures.service';
import { Picture } from './picture.entity';
import { ConfigModule } from '@nestjs/config';
import cloudinaryConfig from '@/config/cloudinary.config';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Module({
  controllers: [PicturesController],
  providers: [PicturesService, CloudinaryProvider],
  imports: [
    TypeOrmModule.forFeature([Picture]),
    ConfigModule.forFeature(cloudinaryConfig),
  ],
  exports: [PicturesService],
})
export class PicturesModule {}
