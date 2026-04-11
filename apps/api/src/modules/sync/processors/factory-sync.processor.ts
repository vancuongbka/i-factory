import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

interface SyncJobData {
  sourceFactoryId: string;
  targetFactoryId: string;
  requestedAt: string;
}

@Processor('factory-sync')
export class FactorySyncProcessor extends WorkerHost {
  private readonly logger = new Logger(FactorySyncProcessor.name);

  async process(job: Job<SyncJobData>): Promise<void> {
    const { sourceFactoryId, targetFactoryId } = job.data;
    this.logger.log(`Syncing factory ${sourceFactoryId} -> ${targetFactoryId} (job ${job.id})`);

    // TODO: implement idempotent cross-factory sync logic
    // Phải idempotent — kiểm tra version/timestamp trước khi merge

    await job.updateProgress(100);
    this.logger.log(`Sync job ${job.id} completed`);
  }
}
