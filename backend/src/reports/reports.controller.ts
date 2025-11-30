import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReportsService } from './reports.service';
import { ReportStatus } from './report.entity';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('photo', {
        storage: diskStorage({
            destination: './uploads/reports',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                callback(null, `report-${uniqueSuffix}${ext}`);
            }
        }),
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    }))
    create(
        @Body('type') type: string,
        @Body('description') description: string,
        @Body('location') location: string,
        @UploadedFile() photo?: any
    ) {
        // Parse location JSON string
        const parsedLocation = JSON.parse(location);

        // Generate photo URL if photo exists
        const photoUrl = photo ? `/uploads/reports/${photo.filename}` : undefined;

        return this.reportsService.create({
            type: type as any,
            description,
            location: parsedLocation,
            photoUrl
            // userId will be added when authentication is implemented
        });
    }

    @Get()
    findAll() {
        return this.reportsService.findAll();
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: ReportStatus) {
        return this.reportsService.updateStatus(id, status);
    }
}
