import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateQCInspectionDto,
  UpdateQCInspectionDto,
  CreateDefectDto,
  QCResult,
} from '@i-factory/api-types';
import { QCInspectionEntity } from './entities/qc-inspection.entity';
import { QCDefectEntity } from './entities/qc-defect.entity';

@Injectable()
export class QCService {
  constructor(
    @InjectRepository(QCInspectionEntity)
    private readonly inspectionRepo: Repository<QCInspectionEntity>,
    @InjectRepository(QCDefectEntity)
    private readonly defectRepo: Repository<QCDefectEntity>,
  ) {}

  findAll(factoryId: string) {
    return this.inspectionRepo.find({
      where: { factoryId },
      relations: ['defects'],
      order: { inspectedAt: 'DESC' },
    });
  }

  async findById(id: string, factoryId: string) {
    const inspection = await this.inspectionRepo.findOne({
      where: { id, factoryId },
      relations: ['defects'],
    });
    if (!inspection) throw new NotFoundException(`Inspection ${id} not found`);
    return inspection;
  }

  create(factoryId: string, dto: CreateQCInspectionDto) {
    const entity = this.inspectionRepo.create({ ...dto, factoryId });
    return this.inspectionRepo.save(entity);
  }

  async update(id: string, factoryId: string, dto: UpdateQCInspectionDto) {
    const inspection = await this.findById(id, factoryId);
    Object.assign(inspection, dto);
    return this.inspectionRepo.save(inspection);
  }

  async remove(id: string, factoryId: string) {
    const inspection = await this.findById(id, factoryId);
    await this.inspectionRepo.softDelete(inspection.id);
  }

  async addDefect(id: string, factoryId: string, dto: CreateDefectDto) {
    await this.findById(id, factoryId); // validate inspection exists and belongs to factory
    const defect = this.defectRepo.create({ ...dto, inspectionId: id });
    return this.defectRepo.save(defect);
  }

  async setResult(id: string, factoryId: string, result: QCResult) {
    const inspection = await this.findById(id, factoryId);
    inspection.result = result;
    return this.inspectionRepo.save(inspection);
  }
}
