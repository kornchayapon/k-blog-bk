import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PicturesService } from './providers/pictures.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Picture } from './picture.entity';

@Controller('pictures')
export class PicturesController {
  constructor(private readonly picturesService: PicturesService) {}

  @Post('upload-multiple')
  // ใช้ FilesInterceptor สำหรับการรับไฟล์หลายไฟล์ (สูงสุด 10 ไฟล์, field name คือ 'files')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(
    // รับไฟล์เป็นอาร์เรย์ของ Express.Multer.File
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Picture[]> {
    if (!files || files.length === 0) {
      // ส่งค่ากลับหากไม่มีไฟล์
      return [];
    }

    // เรียกใช้ Service เพื่อจัดการการอัปโหลดและบันทึก DB
    const uploadedPictures = await this.picturesService.uploadMultiple(files);

    return uploadedPictures;
  }
}
