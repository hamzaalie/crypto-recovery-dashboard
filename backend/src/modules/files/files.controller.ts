import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Multer } from 'multer';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.filesService.uploadFile(req.user.id, file, entityType, entityId);
  }

  @Get()
  findAll(@Request() req) {
    return this.filesService.findAll(req.user.id);
  }

  @Get('entity/:entityType/:entityId')
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.filesService.findByEntity(entityType, entityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { file, buffer } = await this.filesService.getFileBuffer(id);
    
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });

    return new StreamableFile(buffer);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.filesService.remove(id, req.user.id);
  }
}
