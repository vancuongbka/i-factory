import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReportRequestDto } from '@i-factory/api-types';

@Processor('reports')
export class ProductionReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ProductionReportProcessor.name);

  async process(job: Job<ReportRequestDto>): Promise<{ downloadUrl: string }> {
    this.logger.log(`Processing report job ${job.id}: ${job.name}`);

    // TODO: implement actual report generation logic
    // Phải idempotent — safe khi retry nhiều lần

    await job.updateProgress(50);

    // Simulate processing
    const downloadUrl = `/api/reports/download/${job.id ?? 'unknown'}.${job.data.format}`;

    await job.updateProgress(100);
    this.logger.log(`Report job ${job.id} completed`);

    return { downloadUrl };
  }
}
