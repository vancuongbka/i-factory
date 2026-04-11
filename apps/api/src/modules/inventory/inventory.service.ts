import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialEntity } from './entities/material.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly repo: Repository<MaterialEntity>,
  ) {}

  findAllMaterials(factoryId: string) {
    return this.repo.find({ where: { factoryId, isActive: true } });
  }

  findLowStock(factoryId: string) {
    return this.repo
      .createQueryBuilder('m')
      .where('m.factoryId = :factoryId', { factoryId })
      .andWhere('m.currentStock <= m.minStockLevel')
      .andWhere('m.isActive = true')
      .getMany();
  }
}
