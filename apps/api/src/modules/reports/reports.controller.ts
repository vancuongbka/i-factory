import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Yêu cầu tạo báo cáo (async)' })
  @UsePipes(new ZodValidationPipe(reportRequestSchema))
  requestReport(@Body() dto: ReportRequestDto) {
    return this.reportsService.requestReport(dto);
  }

  @Get(':jobId/status')
  @ApiOperation({ summary: 'Kiểm tra trạng thái báo cáo' })
  getStatus(@Param('jobId') jobId: string) {
    return this.reportsService.getJobStatus(jobId);
  }
}
