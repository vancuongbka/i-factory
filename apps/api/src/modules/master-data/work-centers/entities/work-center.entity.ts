import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkCenterType } from '@i-factory/api-types';
import { MachineEntity } from './machine.entity';

@Entity('work_centers')
export class WorkCenterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'enum', enum: WorkCenterType })
  type!: WorkCenterType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  capacityPerHour?: number;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => MachineEntity, (m) => m.workCenter)
  machines?: MachineEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
