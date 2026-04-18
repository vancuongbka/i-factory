import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ScheduleEntryEntity } from './schedule-entry.entity';

/**
 * Append-only unit-completion record submitted by operators.
 * No soft-delete: production logs are an immutable audit trail.
 */
@Entity('production_logs')
export class ProductionLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  scheduleEntryId!: string;

  @ManyToOne(() => ScheduleEntryEntity, (entry) => entry.productionLogs, { onDelete: 'RESTRICT' })
  scheduleEntry?: ScheduleEntryEntity;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid' })
  cncMachineId!: string;

  @Column({ type: 'uuid' })
  operatorId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  loggedAt!: Date;

  @Column({ type: 'int' })
  completedQty!: number;

  @Column({ type: 'int', default: 0 })
  scrapQty!: number;

  @Column({ type: 'int', nullable: true })
  cycleTimeActualSeconds?: number;

  @Column({ type: 'text', nullable: true })
  operatorNotes?: string;
}
