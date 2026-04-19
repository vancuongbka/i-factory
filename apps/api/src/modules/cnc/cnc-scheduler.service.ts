import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CncSchedulerService {
  private readonly logger = new Logger(CncSchedulerService.name);

  constructor(
    @InjectQueue('cnc-schedule-archive')
    private readonly archiveQueue: Queue,
  ) {}

  @Cron('5 0 * * *')
  async triggerNightlyArchive() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const beforeDate = yesterday.toISOString().slice(0, 10);
    await this.archiveQueue.add(
      'archive',
      { beforeDate },
      { removeOnComplete: true, jobId: `nightly-archive:${beforeDate}` },
    );
    this.logger.log(`Nightly archive job enqueued for schedules before ${beforeDate}`);
  }
}
