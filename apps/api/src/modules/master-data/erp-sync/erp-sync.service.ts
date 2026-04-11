import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ErpSyncPayload } from '@i-factory/api-types';

@Injectable()
export class ErpSyncService {
  constructor(@InjectQueue('erp-sync') private readonly erpSyncQueue: Queue) {}

  async enqueue(factoryId: string, dto: ErpSyncPayload) {
    const job = await this.erpSyncQueue.add(
      dto.entityType,
      { ...dto, factoryId, requestedAt: new Date().toISOString() },
      { attempts: 3, backoff: { type: 'exponential', delay: 10000 } },
    );

    return {
      jobId: job.id,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
  }

  async getStatus(jobId: string) {
    const job = await this.erpSyncQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const status =
      state === 'completed' ? 'completed' : state === 'failed' ? 'failed' : 'processing';

    return {
      jobId: job.id,
      status,
      createdAt: new Date(job.timestamp).toISOString(),
    };
  }
}
