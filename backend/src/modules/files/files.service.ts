import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Multer } from 'multer';

@Injectable()
export class FilesService {
  private uploadPath = './uploads';

  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    entityType?: string,
    entityId?: string,
  ): Promise<File> {
    const filename = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Save file record to database
    const fileRecord = this.filesRepository.create({
      userId,
      originalName: file.originalname,
      filename,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath,
      entityType,
      entityId,
    });

    return this.filesRepository.save(fileRecord);
  }

  async findAll(userId: string) {
    return this.filesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.filesRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<File> {
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async getFileBuffer(id: string): Promise<{ file: File; buffer: Buffer }> {
    const file = await this.findOne(id);
    
    if (!fs.existsSync(file.path)) {
      throw new NotFoundException('File not found on disk');
    }

    const buffer = fs.readFileSync(file.path);
    return { file, buffer };
  }

  async remove(id: string, userId: string): Promise<void> {
    const file = await this.findOne(id);
    
    // Delete from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await this.filesRepository.remove(file);
  }
}
