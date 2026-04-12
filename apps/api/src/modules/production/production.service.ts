import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductionOrderDto, UpdateProductionOrderDto } from '@i-factory/api-types';
import { ProductionOrderEntity } from './entities/production-order.entity';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrderEntity)
    private readonly repo: Repository<ProductionOrderEntity>,
  ) {}

  findAll(factoryId: string) {
    return this.repo.find({
      where: { factoryId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, factoryId: string) {
    const order = await this.repo.findOne({ where: { id, factoryId } });
    if (!order) throw new NotFoundException(`Production order ${id} not found`);
    return order;
  }

  create(factoryId: string, dto: CreateProductionOrderDto) {
    const entity = this.repo.create({ ...dto, factoryId });
    return this.repo.save(entity);
  }

  async update(id: string, factoryId: string, dto: UpdateProductionOrderDto) {
    const order = await this.findById(id, factoryId);
    Object.assign(order, dto);
    return this.repo.save(order);
  }

  async remove(id: string, factoryId: string) {
    const order = await this.findById(id, factoryId);
    await this.repo.softDelete(order.id);
  }
}
