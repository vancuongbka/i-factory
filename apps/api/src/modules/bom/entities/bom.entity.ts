import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BomItemEntity } from './bom-item.entity';

@Entity('boms')
export class BomEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid', nullable: true })
  productId?: string;

  // Lazy import to avoid circular dependency with ProductEntity
  @ManyToOne('ProductEntity', { nullable: true, onDelete: 'SET NULL' })
  product?: unknown;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 200 })
  productName!: string;

  @Column({ length: 20, default: '1.0' })
  version!: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  outputQuantity!: number;

  @Column({ length: 20 })
  outputUnit!: string;

  @Column({ default: false })
  isPhantom!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @OneToMany(() => BomItemEntity, (item) => item.bom, { cascade: true })
  items?: BomItemEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
