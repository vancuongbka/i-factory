import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CncMachineStatus, CreateCncDowntimeDto, ResolveCncDowntimeDto } from '@i-factory/api-types';
import { MachineDowntimeEntity } from '../entities/machine-downtime.entity';
import { CncMachineEntity } from '../entities/cnc-machine.entity';
import { CncGateway } from '../cnc.gateway';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class MachineDowntimeService {
  constructor(
    @InjectRepository(MachineDowntimeEntity)
    private readonly repo: Repository<MachineDowntimeEntity>,
    @InjectRepository(CncMachineEntity)
    private readonly machineRepo: Repository<CncMachineEntity>,
    private readonly gateway: CncGateway,
    private readonly notifications: NotificationsService,
  ) {}

  findByMachine(cncMachineId: string, factoryId: string) {
    return this.repo.find({
      where: { cncMachineId, factoryId },
      order: { startedAt: 'DESC' },
    });
  }

  findActive(factoryId: string) {
    return this.repo
      .createQueryBuilder('d')
      .where('d.factoryId = :factoryId', { factoryId })
      .andWhere('d.resolvedAt IS NULL')
      .orderBy('d.startedAt', 'DESC')
      .getMany();
  }

  async raise(factoryId: string, userId: string, dto: CreateCncDowntimeDto) {
    const machine = await this.machineRepo.findOne({
      where: { id: dto.cncMachineId, factoryId },
    });
    if (!machine) throw new NotFoundException(`CNC machine ${dto.cncMachineId} not found`);

    const record = this.repo.create({
      factoryId,
      raisedBy: userId,
      ...dto,
      startedAt: new Date(dto.startedAt),
    });
    const saved = await this.repo.save(record);

    await this.machineRepo.update(
      { id: dto.cncMachineId },
      { currentStatus: CncMachineStatus.ERROR, lastStatusChangedAt: new Date() },
    );

    this.gateway.emitToFactory(factoryId, 'cnc:downtime-raised', {
      id: saved.id,
      cncMachineId: saved.cncMachineId,
      faultCode: saved.faultCode,
    });
    void this.notifications.create({
      factoryId,
      type: 'cnc:downtime-raised',
      title: `Machine downtime raised: ${machine.name}`,
      message: `Fault: ${saved.faultCode ?? 'unknown'}. ${saved.description ?? ''}`.trim(),
      metadata: { downtimeId: saved.id, cncMachineId: saved.cncMachineId },
    });
    return saved;
  }

  async resolve(id: string, factoryId: string, userId: string, dto: ResolveCncDowntimeDto) {
    const record = await this.repo.findOne({ where: { id, factoryId } });
    if (!record) throw new NotFoundException(`Downtime record ${id} not found`);
    if (record.resolvedAt) {
      throw new UnprocessableEntityException('This downtime record is already resolved');
    }

    const resolvedAt = new Date(dto.resolvedAt);
    record.resolvedAt = resolvedAt;
    record.resolvedBy = userId;
    record.rootCause = dto.rootCause;
    record.correctiveAction = dto.correctiveAction;
    record.durationMinutes = Math.round(
      (resolvedAt.getTime() - record.startedAt.getTime()) / 60000,
    );
    const saved = await this.repo.save(record);

    await this.machineRepo.update(
      { id: record.cncMachineId },
      { currentStatus: CncMachineStatus.IDLE, lastStatusChangedAt: resolvedAt },
    );

    this.gateway.emitToFactory(factoryId, 'cnc:downtime-resolved', {
      id: saved.id,
      cncMachineId: saved.cncMachineId,
      durationMinutes: saved.durationMinutes,
    });
    return saved;
  }
}
