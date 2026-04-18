import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { CncMachineStatus, ScheduleEntryStatus } from '@i-factory/api-types';
import { ScheduleEntryEntity } from '../entities/schedule-entry.entity';
import { CncMachineEntity } from '../entities/cnc-machine.entity';
import { CncGateway } from '../cnc.gateway';

interface AutoPauseJobData {
  scheduleEntryId: string;
  factoryId: string;
}

@Processor('cnc-shift-transition')
export class CncShiftTransitionProcessor extends WorkerHost {
  private readonly logger = new Logger(CncShiftTransitionProcessor.name);

  constructor(
    @InjectRepository(ScheduleEntryEntity)
    private readonly entryRepo: Repository<ScheduleEntryEntity>,
    @InjectRepository(CncMachineEntity)
    private readonly machineRepo: Repository<CncMachineEntity>,
    private readonly gateway: CncGateway,
  ) {
    super();
  }

  async process(job: Job<AutoPauseJobData>): Promise<void> {
    const { scheduleEntryId, factoryId } = job.data;
    this.logger.log(`Auto-pause job ${job.id ?? ''} for entry ${scheduleEntryId}`);

    const entry = await this.entryRepo.findOne({ where: { id: scheduleEntryId, factoryId } });
    if (!entry || entry.status !== ScheduleEntryStatus.RUNNING) {
      return;
    }

    entry.status = ScheduleEntryStatus.PAUSED;
    await this.entryRepo.save(entry);

    await this.machineRepo.update(
      { id: entry.cncMachineId },
      {
        currentStatus: CncMachineStatus.IDLE,
        currentScheduleEntryId: undefined,
        lastStatusChangedAt: new Date(),
      },
    );

    this.gateway.emitToFactory(factoryId, 'cnc:entry-status-advanced', {
      id: entry.id,
      status: ScheduleEntryStatus.PAUSED,
      cncMachineId: entry.cncMachineId,
      reason: 'auto-pause:shift-end',
    });

    this.logger.log(`Entry ${scheduleEntryId} auto-paused at shift boundary`);
  }
}
