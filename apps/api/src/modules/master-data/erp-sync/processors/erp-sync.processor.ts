import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ErpSyncPayload } from '@i-factory/api-types';

interface ErpSyncJobData extends ErpSyncPayload {
  factoryId: string;
  requestedAt: string;
}

@Processor('erp-sync')
export class ErpSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(ErpSyncProcessor.name);

  async process(job: Job<ErpSyncJobData>): Promise<void> {
    const { factoryId, entityType, records, syncMode, dryRun } = job.data;

    this.logger.log(
      `Processing ERP sync job ${job.id}: ${entityType} × ${records.length} records ` +
        `(mode=${syncMode}, dryRun=${dryRun}) for factory ${factoryId}`,
    );

    await job.updateProgress(10);

    if (dryRun) {
      this.logger.log(`Dry-run mode — skipping persistence for job ${job.id}`);
      await job.updateProgress(100);
      return;
    }

    // TODO: implement entity-specific upsert/replace logic per entityType
    // UPSERT: INSERT ... ON CONFLICT (factoryId, code/sku) DO UPDATE
    // REPLACE: transaction — softDelete all existing, then bulk insert
    // Must be idempotent — safe to retry with the same job payload

    await job.updateProgress(100);
    this.logger.log(`ERP sync job ${job.id} completed`);
  }
}
