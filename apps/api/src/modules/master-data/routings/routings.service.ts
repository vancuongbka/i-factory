import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRoutingDto,
  UpdateRoutingDto,
  CreateRoutingOperationDto,
  UpdateRoutingOperationDto,
} from '@i-factory/api-types';
import { RoutingEntity } from './entities/routing.entity';
import { RoutingOperationEntity } from './entities/routing-operation.entity';

@Injectable()
export class RoutingsService {
  constructor(
    @InjectRepository(RoutingEntity)
    private readonly routingRepo: Repository<RoutingEntity>,
    @InjectRepository(RoutingOperationEntity)
    private readonly operationRepo: Repository<RoutingOperationEntity>,
  ) {}

  findAllRoutings(factoryId: string) {
    return this.routingRepo.find({
      where: { factoryId },
      relations: ['operations', 'product'],
      order: { code: 'ASC' },
    });
  }

  async findRoutingById(id: string, factoryId: string) {
    const entity = await this.routingRepo.findOne({
      where: { id, factoryId },
      relations: ['operations', 'product'],
    });
    if (!entity) throw new NotFoundException(`Routing ${id} not found`);
    return entity;
  }

  async createRouting(dto: CreateRoutingDto) {
    const { operations, ...header } = dto;
    const saved = await this.routingRepo.save(this.routingRepo.create(header));
    const ops = operations.map((op) =>
      this.operationRepo.create({ ...op, routingId: saved.id }),
    );
    await this.operationRepo.save(ops);
    return this.findRoutingById(saved.id, saved.factoryId);
  }

  async updateRouting(id: string, factoryId: string, dto: UpdateRoutingDto) {
    const entity = await this.findRoutingById(id, factoryId);
    return this.routingRepo.save({ ...entity, ...dto });
  }

  async removeRouting(id: string, factoryId: string) {
    await this.findRoutingById(id, factoryId);
    await this.routingRepo.softDelete({ id, factoryId });
  }

  // ── Operations ──────────────────────────────────────────────────────────────

  async addOperation(routingId: string, factoryId: string, dto: CreateRoutingOperationDto) {
    await this.findRoutingById(routingId, factoryId);
    return this.operationRepo.save(this.operationRepo.create({ ...dto, routingId }));
  }

  async findOperationById(id: string, routingId: string) {
    const entity = await this.operationRepo.findOne({ where: { id, routingId } });
    if (!entity) throw new NotFoundException(`Operation ${id} not found`);
    return entity;
  }

  async updateOperation(
    id: string,
    routingId: string,
    factoryId: string,
    dto: UpdateRoutingOperationDto,
  ) {
    await this.findRoutingById(routingId, factoryId);
    const entity = await this.findOperationById(id, routingId);
    return this.operationRepo.save({ ...entity, ...dto });
  }

  async removeOperation(id: string, routingId: string, factoryId: string) {
    await this.findRoutingById(routingId, factoryId);
    await this.findOperationById(id, routingId);
    await this.operationRepo.delete({ id, routingId });
  }
}
