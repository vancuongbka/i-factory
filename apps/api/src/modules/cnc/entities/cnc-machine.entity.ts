import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CncMachineStatus } from '@i-factory/api-types';

@Entity('cnc_machines')
export class CncMachineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  /** Optional link to the MDM machines master record. */
  @Column({ type: 'uuid', nullable: true })
  machineId?: string;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 100, nullable: true })
  model?: string;

  @Column({ type: 'int', nullable: true })
  maxSpindleRpm?: number;

  @Column({ type: 'int', nullable: true })
  numberOfAxes?: number;

  @Column({ type: 'enum', enum: CncMachineStatus, default: CncMachineStatus.IDLE })
  currentStatus!: CncMachineStatus;

  /**
   * UUID of the currently active ScheduleEntry.
   * Stored as a plain UUID column (no @ManyToOne) to avoid a circular
   * dependency between CncMachineEntity and ScheduleEntryEntity.
   * The FK constraint is enforced in the migration with ON DELETE SET NULL.
   */
  @Column({ type: 'uuid', nullable: true })
  currentScheduleEntryId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastStatusChangedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
