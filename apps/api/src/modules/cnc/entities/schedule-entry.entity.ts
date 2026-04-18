import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ScheduleEntryStatus } from '@i-factory/api-types';
import { DailyScheduleEntity } from './daily-schedule.entity';
import { ProductionLogEntity } from './production-log.entity';

export interface ToolingRequirement {
  toolCode: string;
  description: string;
  requiredQty: number;
}

@Entity('schedule_entries')
export class ScheduleEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  dailyScheduleId!: string;

  @ManyToOne(() => DailyScheduleEntity, (schedule) => schedule.entries, { onDelete: 'RESTRICT' })
  dailySchedule?: DailyScheduleEntity;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid' })
  cncMachineId!: string;

  @Column({ type: 'uuid' })
  workOrderId!: string;

  @Column({ type: 'uuid' })
  productionOrderId!: string;

  @Column({ type: 'uuid', nullable: true })
  assignedOperatorId?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'enum', enum: ScheduleEntryStatus, default: ScheduleEntryStatus.PENDING })
  status!: ScheduleEntryStatus;

  @Column({ type: 'timestamptz' })
  plannedStart!: Date;

  @Column({ type: 'timestamptz' })
  plannedEnd!: Date;

  @Column({ type: 'int' })
  plannedQty!: number;

  @Column({ type: 'int', default: 0 })
  plannedSetupMinutes!: number;

  @Column({ type: 'int' })
  plannedCycleSeconds!: number;

  @Column({ type: 'timestamptz', nullable: true })
  actualSetupStart?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualRunStart?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualEnd?: Date;

  @Column({ type: 'jsonb', nullable: true })
  toolingRequirements?: ToolingRequirement[];

  @Column({ length: 200 })
  partName!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => ProductionLogEntity, (log) => log.scheduleEntry)
  productionLogs?: ProductionLogEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
