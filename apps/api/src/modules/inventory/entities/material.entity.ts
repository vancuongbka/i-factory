import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('materials')
export class MaterialEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 20 })
  unit!: string;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  currentStock!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  minStockLevel!: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  maxStockLevel?: number;

  @Column({ type: 'uuid', nullable: true })
  warehouseId?: string;

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
