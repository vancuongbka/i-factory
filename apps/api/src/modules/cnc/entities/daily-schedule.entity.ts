import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DailyScheduleStatus } from '@i-factory/api-types';
import { ScheduleEntryEntity } from './schedule-entry.entity';

@Entity('daily_schedules')
export class DailyScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  /** Date-only string in factory timezone, e.g. "2026-04-18". UNIQUE with factoryId. */
  @Column({ type: 'date' })
  scheduleDate!: string;

  @Column({ type: 'enum', enum: DailyScheduleStatus, default: DailyScheduleStatus.DRAFT })
  status!: DailyScheduleStatus;

  @Column({ type: 'smallint', default: 1 })
  shiftCount!: number;

  /** HH:MM string for shift 1 start time, e.g. "06:00". */
  @Column({ type: 'time', nullable: true })
  shift1Start?: string;

  /** HH:MM string for shift 2 start time, e.g. "14:00". */
  @Column({ type: 'time', nullable: true })
  shift2Start?: string;

  /** HH:MM string for shift 3 start time, e.g. "22:00". */
  @Column({ type: 'time', nullable: true })
  shift3Start?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  publishedBy?: string;

  @Column({ type: 'uuid' })
  createdBy!: string;

  @OneToMany(() => ScheduleEntryEntity, (entry) => entry.dailySchedule)
  entries?: ScheduleEntryEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
