import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateDailyScheduleDto,
  DailyScheduleStatus,
  UpdateDailyScheduleDto,
} from '@i-factory/api-types';
import { DailyScheduleEntity } from '../entities/daily-schedule.entity';
import { CncGateway } from '../cnc.gateway';

@Injectable()
export class DailySchedulesService {
  constructor(
    @InjectRepository(DailyScheduleEntity)
    private readonly repo: Repository<DailyScheduleEntity>,
    private readonly gateway: CncGateway,
  ) {}

  findAll(factoryId: string) {
    return this.repo.find({ where: { factoryId }, order: { scheduleDate: 'DESC' } });
  }

  async findById(id: string, factoryId: string) {
    const schedule = await this.repo.findOne({
      where: { id, factoryId },
      relations: ['entries'],
    });
    if (!schedule) throw new NotFoundException(`Daily schedule ${id} not found`);
    return schedule;
  }

  async findByDate(factoryId: string, date: string) {
    const schedule = await this.repo.findOne({
      where: { factoryId, scheduleDate: date },
      relations: ['entries'],
    });
    if (!schedule) throw new NotFoundException(`No schedule found for date ${date}`);
    return schedule;
  }

  async create(factoryId: string, userId: string, dto: CreateDailyScheduleDto) {
    const existing = await this.repo.findOne({
      where: { factoryId, scheduleDate: dto.scheduleDate },
    });
    if (existing) {
      throw new ConflictException(`A schedule for ${dto.scheduleDate} already exists`);
    }
    const schedule = this.repo.create({ factoryId, createdBy: userId, ...dto });
    return this.repo.save(schedule);
  }

  async update(id: string, factoryId: string, dto: UpdateDailyScheduleDto) {
    const schedule = await this.findById(id, factoryId);
    if (schedule.status !== DailyScheduleStatus.DRAFT) {
      throw new UnprocessableEntityException('Only DRAFT schedules can be updated');
    }
    Object.assign(schedule, dto);
    return this.repo.save(schedule);
  }

  async publish(id: string, factoryId: string, userId: string) {
    const schedule = await this.findById(id, factoryId);
    if (schedule.status !== DailyScheduleStatus.DRAFT) {
      throw new UnprocessableEntityException('Only DRAFT schedules can be published');
    }
    schedule.status = DailyScheduleStatus.PUBLISHED;
    schedule.publishedAt = new Date();
    schedule.publishedBy = userId;
    const saved = await this.repo.save(schedule);
    this.gateway.emitToFactory(factoryId, 'cnc:schedule-published', {
      id: saved.id,
      scheduleDate: saved.scheduleDate,
    });
    return saved;
  }

  async remove(id: string, factoryId: string) {
    const schedule = await this.findById(id, factoryId);
    if (schedule.status !== DailyScheduleStatus.DRAFT) {
      throw new UnprocessableEntityException('Only DRAFT schedules can be deleted');
    }
    await this.repo.softDelete(schedule.id);
  }
}
