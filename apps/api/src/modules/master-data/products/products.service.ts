import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  CreateUomDto,
  UpdateUomDto,
  CreateProductDto,
  UpdateProductDto,
} from '@i-factory/api-types';
import { ProductCategoryEntity } from './entities/product-category.entity';
import { UnitOfMeasureEntity } from './entities/unit-of-measure.entity';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly categoryRepo: Repository<ProductCategoryEntity>,
    @InjectRepository(UnitOfMeasureEntity)
    private readonly uomRepo: Repository<UnitOfMeasureEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  // ── Categories ──────────────────────────────────────────────────────────────

  findAllCategories(factoryId: string) {
    return this.categoryRepo.find({
      where: { factoryId },
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string, factoryId: string) {
    const entity = await this.categoryRepo.findOne({ where: { id, factoryId }, relations: ['children', 'parent'] });
    if (!entity) throw new NotFoundException(`Category ${id} not found`);
    return entity;
  }

  createCategory(dto: CreateProductCategoryDto) {
    return this.categoryRepo.save(this.categoryRepo.create(dto));
  }

  async updateCategory(id: string, factoryId: string, dto: UpdateProductCategoryDto) {
    const entity = await this.findCategoryById(id, factoryId);
    return this.categoryRepo.save({ ...entity, ...dto });
  }

  async removeCategory(id: string, factoryId: string) {
    await this.findCategoryById(id, factoryId);
    await this.categoryRepo.softDelete({ id, factoryId });
  }

  // ── Units of Measure ────────────────────────────────────────────────────────

  findAllUoms(factoryId: string) {
    return this.uomRepo.find({ where: { factoryId, isActive: true }, order: { code: 'ASC' } });
  }

  async findUomById(id: string, factoryId: string) {
    const entity = await this.uomRepo.findOne({ where: { id, factoryId } });
    if (!entity) throw new NotFoundException(`UoM ${id} not found`);
    return entity;
  }

  createUom(dto: CreateUomDto) {
    return this.uomRepo.save(this.uomRepo.create(dto));
  }

  async updateUom(id: string, factoryId: string, dto: UpdateUomDto) {
    const entity = await this.findUomById(id, factoryId);
    return this.uomRepo.save({ ...entity, ...dto });
  }

  async removeUom(id: string, factoryId: string) {
    await this.findUomById(id, factoryId);
    await this.uomRepo.softDelete({ id, factoryId });
  }

  // ── Products ────────────────────────────────────────────────────────────────

  findAllProducts(factoryId: string) {
    return this.productRepo.find({
      where: { factoryId, isActive: true },
      relations: ['category', 'uom'],
      order: { sku: 'ASC' },
    });
  }

  async findProductById(id: string, factoryId: string) {
    const entity = await this.productRepo.findOne({
      where: { id, factoryId },
      relations: ['category', 'uom'],
    });
    if (!entity) throw new NotFoundException(`Product ${id} not found`);
    return entity;
  }

  createProduct(dto: CreateProductDto) {
    return this.productRepo.save(this.productRepo.create(dto));
  }

  async updateProduct(id: string, factoryId: string, dto: UpdateProductDto) {
    const entity = await this.findProductById(id, factoryId);
    return this.productRepo.save({ ...entity, ...dto });
  }

  async removeProduct(id: string, factoryId: string) {
    await this.findProductById(id, factoryId);
    await this.productRepo.softDelete({ id, factoryId });
  }
}
