import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import * as cloudinary from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

import cloudinaryConfig from '@/config/cloudinary.config';

export type CloudinaryUploadResult = cloudinary.UploadApiResponse;

@Injectable()
export class CloudinaryProvider {
  constructor(
    @Inject(cloudinaryConfig.KEY)
    private readonly cloudinaryConfiguration: ConfigType<
      typeof cloudinaryConfig
    >,
  ) {
    cloudinary.v2.config({
      cloud_name: this.cloudinaryConfiguration.name,
      api_key: this.cloudinaryConfiguration.apiKey,
      api_secret: this.cloudinaryConfiguration.apiSecret,
    });
  }

  public async uploadFile(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResult> {
    try {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = 'data:' + file.mimetype + ';base64,' + b64;

      // สร้าง Public ID ที่ไม่ซ้ำกัน
      const uniquePublicId = this.generateFileName(file);

      // อัปโหลดไปยัง Cloudinary โดยกำหนด Public ID
      const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
        folder: 'nestjs-uploads',
        resource_type: 'auto',
        // *** กำหนด Public ID ที่สร้างขึ้นมา เพื่อให้มั่นใจว่าไม่ซ้ำ ***
        public_id: uniquePublicId,
      });

      return uploadResult;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new InternalServerErrorException(
        'Failed to upload file to Cloudinary',
      );
    }
  }

  private generateFileName(file: Express.Multer.File): string {
    // 1. ดึงชื่อไฟล์และลบส่วนขยาย
    let name = file.originalname.split('.')[0];
    // 2. ลบช่องว่าง (เป็น optional เพราะ Cloudinary จะเข้ารหัสชื่อเอง)
    name = name.replace(/\s/g, '').trim();
    // 3. สร้าง Timestamp และ UUID
    const timeStamp = new Date().getTime().toString().trim();
    // 4. สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    return `${name}-${timeStamp}-${uuidv4()}`; // *ไม่ต้องใส่ extension ใน Public ID*
  }
}
