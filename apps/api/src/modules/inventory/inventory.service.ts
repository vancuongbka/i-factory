import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateStockMovementDto,
  MovementType,
} from '@i-factory/api-types';
import { MaterialEntity } from './entities/material.entity';
import { StockMovementEntity } from './entities/stock-movement.entity';

/** Movement types that decrease stock */
const OUTBOUND = new Set<MovementType>([
  MovementType.ISSUE,
  MovementType.SCRAP,
  MovementType.TRANSFER,
]);

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly materialRepo: Repository<MaterialEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly movementRepo: Repository<StockMovementEntity>,
  ) {}

  // ── Materials ─────────────────────────────────────────────────────────────

  findAllMaterials(factoryId: string) {
    return this.materialRepo.find({
      where: { factoryId, isActive: true },
      order: { code: 'ASC' },
    });
  }

  async findMaterialById(id: string, factoryId: string) {
    const m = await this.materialRepo.findOne({ where: { id, factoryId } });
    if (!m) throw new NotFoundException(`Material ${id} not found`);
    return m;
  }

  findLowStock(factoryId: string) {
    return this.materialRepo
      .createQueryBuilder('m')
      .where('m.factoryId = :factoryId', { factoryId })
      .andWhere('m.currentStock <= m.minStockLevel')
      .andWhere('m.isActive = true')
      .getMany();
  }

  create(factoryId: string, dto: CreateMaterialDto) {
    const entity = this.materialRepo.create({ ...dto, factoryId });
    return this.materialRepo.save(entity);
  }

  async update(id: string, factoryId: string, dto: UpdateMaterialDto) {
    const material = await this.findMaterialById(id, factoryId);
    Object.assign(material, dto);
    return this.materialRepo.save(material);
  }

  async remove(id: string, factoryId: string) {
    const material = await this.findMaterialById(id, factoryId);
    await this.materialRepo.softDelete(material.id);
  }

  // ── Movements ─────────────────────────────────────────────────────────────

  findMovements(factoryId: string, materialId?: string) {
    const where: Record<string, unknown> = { factoryId };
    if (materialId) where['materialId'] = materialId;
    return this.movementRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async recordMovement(
    factoryId: string,
    dto: CreateStockMovementDto,
    createdBy: string,
  ) {
    const material = await this.findMaterialById(dto.materialId, factoryId);

    const delta = OUTBOUND.has(dto.type) ? -Number(dto.quantity) : Number(dto.quantity);
    material.currentStock = Number(material.currentStock) + delta;
    if (material.currentStock < 0) material.currentStock = 0;

    const movement = this.movementRepo.create({ ...dto, factoryId, createdBy });

    await this.materialRepo.save(material);
    return this.movementRepo.save(movement);
  }
}
