import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateBomV2Dto,
  UpdateBomV2Dto,
  AddBomItemDto,
  CreateBomRevisionDto,
} from '@i-factory/api-types';
import { BomEntity } from './entities/bom.entity';
import { BomItemEntity } from './entities/bom-item.entity';
import { BomRevisionEntity } from './entities/bom-revision.entity';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(BomEntity)
    private readonly bomRepo: Repository<BomEntity>,
    @InjectRepository(BomItemEntity)
    private readonly itemRepo: Repository<BomItemEntity>,
    @InjectRepository(BomRevisionEntity)
    private readonly revisionRepo: Repository<BomRevisionEntity>,
  ) {}

  findAll(factoryId: string) {
    return this.bomRepo.find({
      where: { factoryId, isActive: true },
      relations: ['items'],
      order: { code: 'ASC' },
    });
  }

  async findById(id: string, factoryId: string) {
    const bom = await this.bomRepo.findOne({
      where: { id, factoryId },
      relations: ['items'],
    });
    if (!bom) throw new NotFoundException(`BOM ${id} not found`);
    return bom;
  }

  async create(dto: CreateBomV2Dto) {
    const { items, ...header } = dto;
    const bom = await this.bomRepo.save(this.bomRepo.create(header));
    const bomItems = items.map((item) =>
      this.itemRepo.create({ ...item, bomId: bom.id }),
    );
    await this.itemRepo.save(bomItems);
    return this.findById(bom.id, bom.factoryId);
  }

  async update(id: string, factoryId: string, dto: UpdateBomV2Dto) {
    const entity = await this.findById(id, factoryId);
    return this.bomRepo.save({ ...entity, ...dto });
  }

  async remove(id: string, factoryId: string) {
    await this.findById(id, factoryId);
    await this.bomRepo.softDelete({ id, factoryId });
  }

  // ── BOM Items ───────────────────────────────────────────────────────────────

  async addItem(id: string, factoryId: string, dto: AddBomItemDto) {
    await this.findById(id, factoryId);
    return this.itemRepo.save(this.itemRepo.create({ ...dto, bomId: id }));
  }

  async findItemById(itemId: string, bomId: string) {
    const item = await this.itemRepo.findOne({ where: { id: itemId, bomId } });
    if (!item) throw new NotFoundException(`BOM item ${itemId} not found`);
    return item;
  }

  async updateItem(id: string, itemId: string, factoryId: string, dto: Partial<AddBomItemDto>) {
    await this.findById(id, factoryId);
    const entity = await this.findItemById(itemId, id);
    return this.itemRepo.save({ ...entity, ...dto });
  }

  async removeItem(id: string, itemId: string, factoryId: string) {
    await this.findById(id, factoryId);
    await this.findItemById(itemId, id);
    await this.itemRepo.delete({ id: itemId, bomId: id });
  }

  // ── Revisions ───────────────────────────────────────────────────────────────

  findRevisions(bomId: string, factoryId: string) {
    return this.revisionRepo.find({
      where: { bomId, factoryId },
      order: { createdAt: 'DESC' },
    });
  }

  async createRevision(
    id: string,
    factoryId: string,
    revisedBy: string,
    dto: CreateBomRevisionDto,
  ) {
    const bom = await this.findById(id, factoryId);

    const nextVersion = this.bumpVersion(bom.version);

    const revision = this.revisionRepo.create({
      bomId: id,
      factoryId,
      fromVersion: bom.version,
      toVersion: nextVersion,
      revisedBy,
      changeNotes: dto.changeNotes,
      snapshotData: { ...bom, items: bom.items } as unknown as Record<string, unknown>,
    });

    await this.revisionRepo.save(revision);
    await this.bomRepo.save({ ...bom, version: nextVersion, items: undefined });
    return this.findById(id, factoryId);
  }

  private bumpVersion(version: string): string {
    const parts = version.split('.');
    const last = parseInt(parts[parts.length - 1] ?? '0', 10);
    parts[parts.length - 1] = String(last + 1);
    return parts.join('.');
  }
}
