import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SyncService {
  constructor(@InjectQueue('factory-sync') private readonly syncQueue: Queue) {}

  async scheduleSyncJob(sourceFactoryId: string, targetFactoryId: string) {
    return this.syncQueue.add(
      'sync',
      { sourceFactoryId, targetFactoryId, requestedAt: new Date().toISOString() },
      { attempts: 3, backoff: { type: 'exponential', delay: 10000 } },
    );
  }
}
