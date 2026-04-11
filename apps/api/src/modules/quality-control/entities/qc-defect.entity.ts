import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DefectSeverity } from '@i-factory/api-types';
import { QCInspectionEntity } from './qc-inspection.entity';

@Entity('qc_defects')
export class QCDefectEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  inspectionId!: string;

  @ManyToOne(() => QCInspectionEntity, (i) => i.defects, { onDelete: 'CASCADE' })
  inspection?: QCInspectionEntity;

  @Column({ length: 50, nullable: true })
  code?: string;

  @Column({ length: 500 })
  description!: string;

  @Column({ type: 'enum', enum: DefectSeverity })
  severity!: DefectSeverity;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ length: 500, nullable: true })
  rootCause?: string;

  @Column({ length: 500, nullable: true })
  correctiveAction?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
