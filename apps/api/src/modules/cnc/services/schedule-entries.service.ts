import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  AdvanceEntryStatusDto,
  CncMachineStatus,
  CreateScheduleEntryDto,
  ReorderScheduleEntriesDto,
  ScheduleEntryStatus,
  UpdateScheduleEntryDto,
} from '@i-factory/api-types';
import { ScheduleEntryEntity } from '../entities/schedule-entry.entity';
import { ProductionLogEntity } from '../entities/production-log.entity';
import { CncMachineEntity } from '../entities/cnc-machine.entity';
import { CncGateway } from '../cnc.gateway';
import { NotificationsService } from '../../notifications/notifications.service';

const ACTIVE_STATUSES = [
  ScheduleEntryStatus.PENDING,
  ScheduleEntryStatus.SETUP,
  ScheduleEntryStatus.RUNNING,
  ScheduleEntryStatus.PAUSED,
];

const VALID_TRANSITIONS: Record<ScheduleEntryStatus, ScheduleEntryStatus[]> = {
  [ScheduleEntryStatus.PENDING]: [ScheduleEntryStatus.SETUP],
  [ScheduleEntryStatus.SETUP]: [ScheduleEntryStatus.RUNNING],
  [ScheduleEntryStatus.RUNNING]: [
    ScheduleEntryStatus.PAUSED,
    ScheduleEntryStatus.COMPLETED,
    ScheduleEntryStatus.ERROR,
  ],
  [ScheduleEntryStatus.PAUSED]: [ScheduleEntryStatus.RUNNING, ScheduleEntryStatus.ERROR],
  [ScheduleEntryStatus.COMPLETED]: [],
  [ScheduleEntryStatus.ERROR]: [ScheduleEntryStatus.SETUP, ScheduleEntryStatus.RUNNING],
};

@Injectable()
export class ScheduleEntriesService {
  constructor(
    @InjectRepository(ScheduleEntryEntity)
    private readonly repo: Repository<ScheduleEntryEntity>,
    @InjectRepository(ProductionLogEntity)
    private readonly logRepo: Repository<ProductionLogEntity>,
    @InjectRepository(CncMachineEntity)
    private readonly machineRepo: Repository<CncMachineEntity>,
    @InjectQueue('cnc-shift-transition')
    private readonly shiftQueue: Queue,
    private readonly gateway: CncGateway,
    private readonly notifications: NotificationsService,
  ) {}

  async findBySchedule(dailyScheduleId: string, factoryId: string) {
    const entries = await this.repo.find({
      where: { dailyScheduleId, factoryId },
      order: { cncMachineId: 'ASC', sortOrder: 'ASC' },
    });
    return this.enrichWithProgress(entries);
  }

  async findById(id: string, factoryId: string) {
    const entry = await this.repo.findOne({ where: { id, factoryId } });
    if (!entry) throw new NotFoundException(`Schedule entry ${id} not found`);
    const enriched = await this.enrichWithProgress([entry]);
    return enriched[0]!;
  }

  async create(factoryId: string, dto: CreateScheduleEntryDto) {
    const plannedStart = new Date(dto.plannedStart);
    const plannedEnd = new Date(dto.plannedEnd);
    await this.checkConflict(dto.cncMachineId, factoryId, plannedStart, plannedEnd);
    const entry = this.repo.create({ factoryId, ...dto, plannedStart, plannedEnd });
    const saved = await this.repo.save(entry);
    const enriched = await this.enrichWithProgress([saved]);
    return enriched[0]!;
  }

  async update(id: string, factoryId: string, dto: UpdateScheduleEntryDto) {
    const entry = await this.repo.findOne({ where: { id, factoryId } });
    if (!entry) throw new NotFoundException(`Schedule entry ${id} not found`);
    if (
      entry.status !== ScheduleEntryStatus.PENDING &&
      entry.status !== ScheduleEntryStatus.SETUP
    ) {
      throw new UnprocessableEntityException('Only PENDING or SETUP entries can be updated');
    }
    const machineId = dto.cncMachineId ?? entry.cncMachineId;
    const plannedStart = dto.plannedStart ? new Date(dto.plannedStart) : entry.plannedStart;
    const plannedEnd = dto.plannedEnd ? new Date(dto.plannedEnd) : entry.plannedEnd;
    if (dto.cncMachineId ?? dto.plannedStart ?? dto.plannedEnd) {
      await this.checkConflict(machineId, factoryId, plannedStart, plannedEnd, id);
    }
    Object.assign(entry, { ...dto, plannedStart, plannedEnd });
    const saved = await this.repo.save(entry);
    const enriched = await this.enrichWithProgress([saved]);
    return enriched[0]!;
  }

  async remove(id: string, factoryId: string) {
    const entry = await this.repo.findOne({ where: { id, factoryId } });
    if (!entry) throw new NotFoundException(`Schedule entry ${id} not found`);
    if (entry.status !== ScheduleEntryStatus.PENDING) {
      throw new UnprocessableEntityException('Only PENDING entries can be deleted');
    }
    await this.repo.softDelete(id);
  }

  async advanceStatus(id: string, factoryId: string, dto: AdvanceEntryStatusDto) {
    const entry = await this.repo.findOne({ where: { id, factoryId } });
    if (!entry) throw new NotFoundException(`Schedule entry ${id} not found`);

    const allowed = VALID_TRANSITIONS[entry.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new UnprocessableEntityException(
        `Cannot transition from ${entry.status} to ${dto.status}`,
      );
    }

    const now = new Date();
    entry.status = dto.status;

    switch (dto.status) {
      case ScheduleEntryStatus.SETUP:
        entry.actualSetupStart = now;
        break;

      case ScheduleEntryStatus.RUNNING:
        if (!entry.actualRunStart) entry.actualRunStart = now;
        await this.machineRepo.update(
          { id: entry.cncMachineId },
          {
            currentStatus: CncMachineStatus.RUNNING,
            currentScheduleEntryId: entry.id,
            lastStatusChangedAt: now,
          },
        );
        // Schedule auto-pause at planned end
        {
          const delayMs = entry.plannedEnd.getTime() - now.getTime();
          if (delayMs > 0) {
            await this.shiftQueue.add(
              'auto-pause',
              { scheduleEntryId: entry.id, factoryId },
              { delay: delayMs, jobId: `auto-pause:${entry.id}` },
            );
          }
        }
        break;

      case ScheduleEntryStatus.PAUSED:
        await this.machineRepo.update(
          { id: entry.cncMachineId },
          {
            currentStatus: CncMachineStatus.IDLE,
            currentScheduleEntryId: undefined,
            lastStatusChangedAt: now,
          },
        );
        break;

      case ScheduleEntryStatus.COMPLETED:
        if (!entry.actualEnd) entry.actualEnd = now;
        await this.machineRepo.update(
          { id: entry.cncMachineId },
          {
            currentStatus: CncMachineStatus.IDLE,
            currentScheduleEntryId: undefined,
            lastStatusChangedAt: now,
          },
        );
        break;

      case ScheduleEntryStatus.ERROR:
        await this.machineRepo.update(
          { id: entry.cncMachineId },
          { currentStatus: CncMachineStatus.ERROR, lastStatusChangedAt: now },
        );
        void this.notifications.create({
          factoryId,
          type: 'cnc:entry-error',
          title: `Schedule entry error: ${entry.partName ?? entry.id}`,
          message: `Entry ${entry.id} transitioned to ERROR on machine ${entry.cncMachineId}.`,
          metadata: { entryId: entry.id, cncMachineId: entry.cncMachineId },
        });
        break;
    }

    const saved = await this.repo.save(entry);
    this.gateway.emitToFactory(factoryId, 'cnc:entry-status-advanced', {
      id: saved.id,
      status: saved.status,
      cncMachineId: saved.cncMachineId,
    });
    const enriched = await this.enrichWithProgress([saved]);
    return enriched[0]!;
  }

  async reorder(factoryId: string, dto: ReorderScheduleEntriesDto) {
    await Promise.all(
      dto.sortedEntryIds.map((entryId, index) =>
        this.repo.update(
          { id: entryId, factoryId, cncMachineId: dto.cncMachineId },
          { sortOrder: index },
        ),
      ),
    );
  }

  private async checkConflict(
    cncMachineId: string,
    factoryId: string,
    plannedStart: Date,
    plannedEnd: Date,
    excludeId?: string,
  ) {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.cncMachineId = :cncMachineId', { cncMachineId })
      .andWhere('e.factoryId = :factoryId', { factoryId })
      .andWhere('e.status IN (:...statuses)', { statuses: ACTIVE_STATUSES })
      .andWhere('e.plannedStart < :plannedEnd', { plannedEnd })
      .andWhere('e.plannedEnd > :plannedStart', { plannedStart })
      .andWhere('e.deletedAt IS NULL');

    if (excludeId) {
      qb.andWhere('e.id != :excludeId', { excludeId });
    }

    const conflict = await qb.getOne();
    if (conflict) {
      const overlapStart =
        plannedStart > conflict.plannedStart ? plannedStart : conflict.plannedStart;
      const overlapEnd = plannedEnd < conflict.plannedEnd ? plannedEnd : conflict.plannedEnd;
      throw new ConflictException({
        conflictingEntryId: conflict.id,
        conflictingEntryWorkOrderCode: conflict.partName,
        overlapStartsAt: overlapStart.toISOString(),
        overlapEndsAt: overlapEnd.toISOString(),
      });
    }
  }

  private async enrichWithProgress(entries: ScheduleEntryEntity[]) {
    if (entries.length === 0) return [];
    const ids = entries.map((e) => e.id);
    const logs = await this.logRepo
      .createQueryBuilder('l')
      .select('l.scheduleEntryId', 'entryId')
      .addSelect('SUM(l.completedQty)', 'completedQty')
      .where('l.scheduleEntryId IN (:...ids)', { ids })
      .groupBy('l.scheduleEntryId')
      .getRawMany<{ entryId: string; completedQty: string }>();

    const completedMap = new Map(logs.map((l) => [l.entryId, parseInt(l.completedQty, 10)]));

    return entries.map((e) => {
      const cumulativeCompletedQty = completedMap.get(e.id) ?? 0;
      const progressPct =
        e.plannedQty > 0
          ? Math.min(100, Math.round((cumulativeCompletedQty / e.plannedQty) * 100))
          : 0;
      const overrun = new Date() > e.plannedEnd && e.status !== ScheduleEntryStatus.COMPLETED;
      return { ...e, cumulativeCompletedQty, progressPct, overrun };
    });
  }
}
