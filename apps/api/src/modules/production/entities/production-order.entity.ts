import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductionStatus } from '@i-factory/api-types';

@Entity('production_orders')
export class ProductionOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 200 })
  productName!: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity!: number;

  @Column({ length: 20 })
  unit!: string;

  @Column({ type: 'enum', enum: ProductionStatus, default: ProductionStatus.DRAFT })
  status!: ProductionStatus;

  @Column({ type: 'timestamptz' })
  plannedStartDate!: Date;

  @Column({ type: 'timestamptz' })
  plannedEndDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualStartDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualEndDate?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  completedQuantity!: number;

  @Column({ type: 'uuid', nullable: true })
  bomId?: string;

  @Column({ type: 'uuid', nullable: true })
  productionLineId?: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
