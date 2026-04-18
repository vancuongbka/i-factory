import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Job } from 'bullmq';
import { DailyScheduleStatus } from '@i-factory/api-types';
import { DailyScheduleEntity } from '../entities/daily-schedule.entity';
import { CncGateway } from '../cnc.gateway';

interface ArchiveJobData {
  /** Archive schedules whose scheduleDate is strictly before this date (YYYY-MM-DD). */
  beforeDate: string;
  /** When supplied, only archives schedules for this factory. */
  factoryId?: string;
}

const ARCHIVABLE_STATUSES = [
  DailyScheduleStatus.PUBLISHED,
  DailyScheduleStatus.IN_PROGRESS,
  DailyScheduleStatus.COMPLETED,
];

@Processor('cnc-schedule-archive')
export class CncScheduleArchiveProcessor extends WorkerHost {
  private readonly logger = new Logger(CncScheduleArchiveProcessor.name);

  constructor(
    @InjectRepository(DailyScheduleEntity)
    private readonly scheduleRepo: Repository<DailyScheduleEntity>,
    private readonly gateway: CncGateway,
  ) {
    super();
  }

  async process(job: Job<ArchiveJobData>): Promise<{ archivedCount: number }> {
    const { beforeDate, factoryId } = job.data;
    this.logger.log(
      `Archiving schedules before ${beforeDate}${factoryId ? ` for factory ${factoryId}` : ''}`,
    );

    const qb = this.scheduleRepo
      .createQueryBuilder('s')
      .where('s.scheduleDate < :beforeDate', { beforeDate })
      .andWhere('s.status IN (:...statuses)', { statuses: ARCHIVABLE_STATUSES })
      .andWhere('s.deletedAt IS NULL');

    if (factoryId) {
      qb.andWhere('s.factoryId = :factoryId', { factoryId });
    }

    const schedules = await qb.getMany();

    if (schedules.length === 0) {
      this.logger.log('No schedules to archive');
      return { archivedCount: 0 };
    }

    await this.scheduleRepo.update(
      { id: In(schedules.map((s) => s.id)) },
      { status: DailyScheduleStatus.ARCHIVED },
    );

    const factoryIds = [...new Set(schedules.map((s) => s.factoryId))];
    for (const fid of factoryIds) {
      const count = schedules.filter((s) => s.factoryId === fid).length;
      this.gateway.emitToFactory(fid, 'cnc:schedule-archived', { archivedCount: count, beforeDate });
    }

    this.logger.log(`Archived ${schedules.length} schedules`);
    return { archivedCount: schedules.length };
  }
}
