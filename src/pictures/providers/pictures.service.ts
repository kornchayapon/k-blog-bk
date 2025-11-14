import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CloudinaryProvider } from './cloudinary.provider';
import { Picture } from '../picture.entity';

import { CloudinaryUploadResult } from '../providers/cloudinary.provider';

@Injectable()
export class PicturesService {
  constructor(
    @InjectRepository(Picture)
    private picturesRepository: Repository<Picture>,

    private cloudinaryProvider: CloudinaryProvider,
  ) {}

  public async uploadMultiplePictures(
    files: Express.Multer.File[],
  ): Promise<Picture[]> {
    if (!files || files.length === 0) {
      return [];
    }

    try {
      // 1. อัปโหลดไฟล์ทั้งหมดไปยัง Cloudinary พร้อมกัน (Provider จะสร้างชื่อใหม่ให้)
      const uploadPromises = files.map((file) =>
        this.cloudinaryProvider.uploadFile(file),
      );
      const results: CloudinaryUploadResult[] =
        await Promise.all(uploadPromises);

      // 2. สร้าง Picture entities จากผลลัพธ์การอัปโหลด
      const pictureEntities = results.map((result) => {
        const newPicture = this.picturesRepository.create({
          path: result.secure_url,
          // ใช้ public_id ที่ถูก generate ใหม่ (ซึ่งรับประกันว่าไม่ซ้ำ)
          name: result.public_id,
          // ใช้ bytes ที่ Cloudinary รายงานมา
          size: result.bytes,
        });
        return newPicture;
      });

      // 3. บันทึก entities ทั้งหมดลงในฐานข้อมูล
      const savedPictures = await this.picturesRepository.save(pictureEntities);

      return savedPictures;
    } catch (error) {
      console.error('Error during multi-file upload and save:', error);
      throw new InternalServerErrorException(
        'An error occurred during file upload and database saving.',
      );
    }
  }
}
