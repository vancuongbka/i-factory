import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReportRequestDto } from '@i-factory/api-types';

@Injectable()
export class ReportsService {
  constructor(@InjectQueue('reports') private readonly reportsQueue: Queue) {}

  async requestReport(dto: ReportRequestDto) {
    const job = await this.reportsQueue.add(dto.type, dto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    return {
      jobId: job.id,
      status: 'queued',
      downloadUrl: null,
      createdAt: new Date().toISOString(),
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.reportsQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const returnvalue = job.returnvalue as { downloadUrl?: string } | undefined;

    return {
      jobId: job.id,
      status: state === 'completed' ? 'completed' : state === 'failed' ? 'failed' : 'processing',
      downloadUrl: returnvalue?.downloadUrl ?? null,
      progress: typeof job.progress === 'number' ? job.progress : 0,
      createdAt: new Date(job.timestamp).toISOString(),
    };
  }

  async getReportFilePath(jobId: string): Promise<string | null> {
    const job = await this.reportsQueue.getJob(jobId);
    if (!job) return null;
    const state = await job.getState();
    if (state !== 'completed') return null;
    const returnvalue = job.returnvalue as { filePath?: string } | undefined;
    return returnvalue?.filePath ?? null;
  }
}
