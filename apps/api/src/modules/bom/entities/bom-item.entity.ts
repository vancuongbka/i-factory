import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BomEntity } from './bom.entity';

@Entity('bom_items')
export class BomItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  bomId!: string;

  @ManyToOne(() => BomEntity, (bom) => bom.items, { onDelete: 'CASCADE' })
  bom?: BomEntity;

  @Column({ type: 'int', default: 1 })
  sequence!: number;

  @Column({ type: 'uuid', nullable: true })
  materialId?: string;

  @Column({ type: 'uuid', nullable: true })
  childBomId?: string;

  @ManyToOne(() => BomEntity, { nullable: true, onDelete: 'SET NULL' })
  childBom?: BomEntity;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity!: number;

  @Column({ length: 20 })
  unit!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  wastePercentage!: number;

  @Column({ length: 500, nullable: true })
  notes?: string;
}
