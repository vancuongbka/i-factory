import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MachineStatus } from '@i-factory/api-types';
import { WorkCenterEntity } from './work-center.entity';

@Entity('machines')
export class MachineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid' })
  workCenterId!: string;

  @ManyToOne(() => WorkCenterEntity, (wc) => wc.machines, { onDelete: 'RESTRICT' })
  workCenter?: WorkCenterEntity;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 100, nullable: true })
  model?: string;

  @Column({ length: 100, nullable: true })
  serialNumber?: string;

  @Column({ type: 'enum', enum: MachineStatus, default: MachineStatus.IDLE })
  status!: MachineStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  capacityPerHour?: number;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
