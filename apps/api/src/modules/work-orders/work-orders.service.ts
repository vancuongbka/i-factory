import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrderEntity } from './entities/work-order.entity';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrderEntity)
    private readonly repo: Repository<WorkOrderEntity>,
  ) {}

  findAll(factoryId: string) {
    return this.repo.find({ where: { factoryId }, relations: ['steps'] });
  }

  findById(id: string, factoryId: string) {
    return this.repo.findOneOrFail({ where: { id, factoryId }, relations: ['steps'] });
  }
}
