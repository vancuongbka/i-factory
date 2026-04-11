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
import { WorkOrderStatus } from '@i-factory/api-types';
import { ProductionOrderEntity } from '../../production/entities/production-order.entity';
import { WorkOrderStepEntity } from './work-order-step.entity';

@Entity('work_orders')
export class WorkOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid' })
  productionOrderId!: string;

  @ManyToOne(() => ProductionOrderEntity, { onDelete: 'RESTRICT' })
  productionOrder?: ProductionOrderEntity;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.PENDING })
  status!: WorkOrderStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedTo?: string;

  @Column({ type: 'timestamptz' })
  plannedStartDate!: Date;

  @Column({ type: 'timestamptz' })
  plannedEndDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualStartDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualEndDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, unknown>;

  @OneToMany(() => WorkOrderStepEntity, (step) => step.workOrder, { cascade: true })
  steps?: WorkOrderStepEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
