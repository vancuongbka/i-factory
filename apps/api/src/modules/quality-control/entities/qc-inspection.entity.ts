import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { QCResult } from '@i-factory/api-types';
import { QCDefectEntity } from './qc-defect.entity';

@Entity('qc_inspections')
export class QCInspectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid', nullable: true })
  workOrderId?: string;

  @Column({ type: 'uuid', nullable: true })
  productionOrderId?: string;

  @Column({ type: 'uuid' })
  inspectorId!: string;

  @Column({ type: 'timestamptz' })
  inspectedAt!: Date;

  @Column({ type: 'int' })
  sampleSize!: number;

  @Column({ type: 'int' })
  passedCount!: number;

  @Column({ type: 'int' })
  failedCount!: number;

  @Column({ type: 'enum', enum: QCResult, default: QCResult.PENDING })
  result!: QCResult;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @OneToMany(() => QCDefectEntity, (d) => d.inspection, { cascade: true })
  defects?: QCDefectEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
