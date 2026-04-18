import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductionLogDto, ScheduleEntryStatus } from '@i-factory/api-types';
import { ProductionLogEntity } from '../entities/production-log.entity';
import { ScheduleEntryEntity } from '../entities/schedule-entry.entity';
import { CncGateway } from '../cnc.gateway';

@Injectable()
export class ProductionLogsService {
  constructor(
    @InjectRepository(ProductionLogEntity)
    private readonly repo: Repository<ProductionLogEntity>,
    @InjectRepository(ScheduleEntryEntity)
    private readonly entryRepo: Repository<ScheduleEntryEntity>,
    private readonly gateway: CncGateway,
  ) {}

  findByEntry(scheduleEntryId: string, factoryId: string) {
    return this.repo.find({
      where: { scheduleEntryId, factoryId },
      order: { loggedAt: 'DESC' },
    });
  }

  async create(factoryId: string, userId: string, dto: CreateProductionLogDto) {
    const entry = await this.entryRepo.findOne({
      where: { id: dto.scheduleEntryId, factoryId },
    });
    if (!entry) throw new NotFoundException(`Schedule entry ${dto.scheduleEntryId} not found`);
    if (entry.status !== ScheduleEntryStatus.RUNNING) {
      throw new UnprocessableEntityException(
        'Production logs can only be added to RUNNING entries',
      );
    }

    const log = this.repo.create({
      scheduleEntryId: dto.scheduleEntryId,
      factoryId,
      cncMachineId: entry.cncMachineId,
      operatorId: userId,
      completedQty: dto.completedQty,
      scrapQty: dto.scrapQty ?? 0,
      cycleTimeActualSeconds: dto.cycleTimeActualSeconds,
      operatorNotes: dto.operatorNotes,
    });

    const saved = await this.repo.save(log);
    this.gateway.emitToFactory(factoryId, 'cnc:production-logged', {
      scheduleEntryId: saved.scheduleEntryId,
      cncMachineId: saved.cncMachineId,
      completedQty: saved.completedQty,
    });
    return saved;
  }
}
