import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QCInspectionEntity } from './entities/qc-inspection.entity';

@Injectable()
export class QCService {
  constructor(
    @InjectRepository(QCInspectionEntity)
    private readonly repo: Repository<QCInspectionEntity>,
  ) {}

  findAll(factoryId: string) {
    return this.repo.find({ where: { factoryId }, relations: ['defects'], order: { inspectedAt: 'DESC' } });
  }
}
