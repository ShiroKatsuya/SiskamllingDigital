import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ReportType } from './report.entity';

export class CreateReportDto {
    @IsEnum(ReportType)
    @IsNotEmpty()
    type: ReportType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    location: string; // JSON string containing coordinates

    @IsString()
    @IsNotEmpty()
    userId: string;
}
