import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrderEntity } from './entities/production-order.entity';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrderEntity)
    private readonly repo: Repository<ProductionOrderEntity>,
  ) {}

  findAll(factoryId: string) {
    return this.repo.find({ where: { factoryId } });
  }

  findById(id: string, factoryId: string) {
    return this.repo.findOneOrFail({ where: { id, factoryId } });
  }
}
