import { Body, Controller, Get, NotFoundException, Param, Post, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { basename, extname } from 'path';
import { reportRequestSchema } from '@i-factory/api-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ReportsService } from './reports.service';
import type { ReportRequestDto } from '@i-factory/api-types';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Request async report generation' })
  @UsePipes(new ZodValidationPipe(reportRequestSchema))
  requestReport(@Body() dto: ReportRequestDto) {
    return this.reportsService.requestReport(dto);
  }

  @Get(':jobId/status')
  @ApiOperation({ summary: 'Poll report job status' })
  getStatus(@Param('jobId') jobId: string) {
    return this.reportsService.getJobStatus(jobId);
  }

  @Get(':jobId/download')
  @ApiOperation({ summary: 'Download completed report file' })
  async downloadReport(
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = await this.reportsService.getReportFilePath(jobId);
    if (!filePath || !existsSync(filePath)) {
      throw new NotFoundException('Report file not found or not yet ready');
    }

    const filename = basename(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = ext === '.csv' ? 'text/csv' : 'application/json';

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    createReadStream(filePath).pipe(res);
  }
}
