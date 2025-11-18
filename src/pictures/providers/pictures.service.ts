import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CloudinaryProvider } from './cloudinary.provider';
import { Picture } from '../picture.entity';

import { CloudinaryUploadResult } from '../providers/cloudinary.provider';
import { DeleteResult } from '../interfaces/delete-result.interface';

@Injectable()
export class PicturesService {
  constructor(
    @InjectRepository(Picture)
    private picturesRepository: Repository<Picture>,

    private cloudinaryProvider: CloudinaryProvider,
  ) {}

  // Upload multiple pictures
  public async uploadMultiple(
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

  // Find Picture by Id
  public async findOneById(id?: number) {
    if (!id) return undefined;
    const picture = await this.picturesRepository.findOneBy({ id });

    return picture ?? undefined;
  }

  // Find multiple Pictures
  public async findMultiple(pictures?: number[]) {
    if (!pictures?.length) {
      return [];
    }

    const results = await this.picturesRepository.find({
      where: {
        id: In(pictures),
      },
    });

    return results;
  }

  // Delete picture
  public async deleteOne(id: number): Promise<DeleteResult> {
    // 1. ค้นหา Entity จาก Database
    const picture = await this.picturesRepository.findOne({ where: { id } });

    if (!picture) {
      throw new NotFoundException(`Picture with ID ${id} not found.`);
    }

    // 2. ดึง Public ID เพื่อใช้ในการลบ
    // Public ID ถูกเก็บไว้ใน field 'name' ใน Entity Picture
    const publicId = picture.name;

    // 3. ลบไฟล์จาก Cloudinary
    // หาก Cloudinary ล้มเหลว ควรหยุดการทำงานและรายงานข้อผิดพลาด
    try {
      const deleteResult = await this.cloudinaryProvider.deleteFile(publicId);
      console.log(deleteResult);

      // เราอาจจะ log ผลลัพธ์ Cloudinary ที่นี่
    } catch (cloudinaryError) {
      // โยน Exception หากการลบไฟล์ Cloudinary ล้มเหลว
      console.error('Failed to delete file on Cloudinary:', cloudinaryError);
      throw new InternalServerErrorException(
        'Failed to delete media file. Database deletion aborted.',
      );
    }

    // 4. ลบข้อมูลจาก Database
    try {
      const deleteDbResult = await this.picturesRepository.delete(id);

      if (deleteDbResult.affected === 0) {
        // โอกาสน้อยที่จะเกิดขึ้น หากผ่านขั้นตอนที่ 1 แล้ว
        throw new InternalServerErrorException(
          'Failed to delete picture data from database.',
        );
      }

      return { deleted: true, message: `Picture ${id} successfully deleted.` };
    } catch (dbError) {
      console.error('Failed to delete picture data from DB:', dbError);
      // การลบ DB ล้มเหลวแต่ไฟล์ถูกลบไปแล้ว ควรแจ้งให้ผู้ใช้ทราบ
      throw new InternalServerErrorException(
        'Media file was deleted, but failed to remove picture data from database.',
      );
    }
  }
}
