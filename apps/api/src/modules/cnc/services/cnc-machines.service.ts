import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CncMachineStatus,
  CreateCncMachineDto,
  UpdateCncMachineDto,
  CncKpiSummary,
} from '@i-factory/api-types';
import { CncMachineEntity } from '../entities/cnc-machine.entity';
import { ScheduleEntryEntity } from '../entities/schedule-entry.entity';
import { ProductionLogEntity } from '../entities/production-log.entity';
import { CncGateway } from '../cnc.gateway';

@Injectable()
export class CncMachinesService {
  constructor(
    @InjectRepository(CncMachineEntity)
    private readonly repo: Repository<CncMachineEntity>,
    @InjectRepository(ScheduleEntryEntity)
    private readonly entryRepo: Repository<ScheduleEntryEntity>,
    @InjectRepository(ProductionLogEntity)
    private readonly logRepo: Repository<ProductionLogEntity>,
    private readonly gateway: CncGateway,
  ) {}

  findAll(factoryId: string) {
    return this.repo.find({ where: { factoryId } });
  }

  async findById(id: string, factoryId: string) {
    const machine = await this.repo.findOne({ where: { id, factoryId } });
    if (!machine) throw new NotFoundException(`CNC machine ${id} not found`);
    return machine;
  }

  async create(factoryId: string, dto: CreateCncMachineDto) {
    const machine = this.repo.create({ factoryId, ...dto });
    return this.repo.save(machine);
  }

  async update(id: string, factoryId: string, dto: UpdateCncMachineDto) {
    const machine = await this.findById(id, factoryId);
    Object.assign(machine, dto);
    return this.repo.save(machine);
  }

  async remove(id: string, factoryId: string) {
    await this.findById(id, factoryId);
    await this.repo.softDelete({ id, factoryId });
  }

  async updateStatus(id: string, factoryId: string, status: CncMachineStatus) {
    const machine = await this.findById(id, factoryId);
    machine.currentStatus = status;
    machine.lastStatusChangedAt = new Date();
    const saved = await this.repo.save(machine);
    this.gateway.emitToFactory(factoryId, 'cnc:machine-status-updated', {
      id: saved.id,
      currentStatus: saved.currentStatus,
      lastStatusChangedAt: saved.lastStatusChangedAt,
    });
    return saved;
  }

  async getKpiSummary(factoryId: string, date: string): Promise<CncKpiSummary> {
    const machines = await this.repo.find({ where: { factoryId } });

    const totalMachines = machines.length;
    const runningCount = machines.filter((m) => m.currentStatus === CncMachineStatus.RUNNING).length;
    const idleCount = machines.filter((m) => m.currentStatus === CncMachineStatus.IDLE).length;
    const errorCount = machines.filter((m) => m.currentStatus === CncMachineStatus.ERROR).length;
    const setupCount = machines.filter((m) => m.currentStatus === CncMachineStatus.SETUP).length;
    const maintenanceCount = machines.filter(
      (m) => m.currentStatus === CncMachineStatus.MAINTENANCE,
    ).length;

    const dateStart = new Date(`${date}T00:00:00.000Z`);
    const dateEnd = new Date(`${date}T23:59:59.999Z`);

    const entries = await this.entryRepo
      .createQueryBuilder('e')
      .where('e.factoryId = :factoryId', { factoryId })
      .andWhere('e.plannedStart >= :dateStart', { dateStart })
      .andWhere('e.plannedStart <= :dateEnd', { dateEnd })
      .andWhere('e.deletedAt IS NULL')
      .getMany();

    const totalPlannedQty = entries.reduce((sum, e) => sum + e.plannedQty, 0);

    let totalCompletedQty = 0;
    const entryIds = entries.map((e) => e.id);
    if (entryIds.length > 0) {
      const agg = await this.logRepo
        .createQueryBuilder('l')
        .select('SUM(l.completedQty)', 'total')
        .where('l.scheduleEntryId IN (:...ids)', { ids: entryIds })
        .getRawOne<{ total: string }>();
      totalCompletedQty = parseInt(agg?.total ?? '0', 10);
    }

    const factoryProgressPct =
      totalPlannedQty > 0
        ? Math.min(100, Math.round((totalCompletedQty / totalPlannedQty) * 100))
        : 0;

    return {
      totalMachines,
      runningCount,
      idleCount,
      errorCount,
      setupCount,
      maintenanceCount,
      factoryProgressPct,
      totalPlannedQty,
      totalCompletedQty,
    };
  }
}
