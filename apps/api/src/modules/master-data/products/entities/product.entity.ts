import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductType } from '@i-factory/api-types';
import { ProductCategoryEntity } from './product-category.entity';
import { UnitOfMeasureEntity } from './unit-of-measure.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ length: 50 })
  sku!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'enum', enum: ProductType })
  type!: ProductType;

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string;

  @ManyToOne(() => ProductCategoryEntity, { nullable: true, onDelete: 'SET NULL' })
  category?: ProductCategoryEntity;

  @Column({ type: 'uuid' })
  uomId!: string;

  @ManyToOne(() => UnitOfMeasureEntity, { onDelete: 'RESTRICT' })
  uom?: UnitOfMeasureEntity;

  @Column({ length: 1000, nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  technicalSpecs?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
