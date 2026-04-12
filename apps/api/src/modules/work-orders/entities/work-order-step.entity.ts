import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkOrderEntity } from './work-order.entity';
import { WorkCenterEntity } from '../../master-data/work-centers/entities/work-center.entity';

@Entity('work_order_steps')
export class WorkOrderStepEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  workOrderId!: string;

  @ManyToOne(() => WorkOrderEntity, (wo) => wo.steps, { onDelete: 'CASCADE' })
  workOrder?: WorkOrderEntity;

  @Column({ type: 'int' })
  stepNumber!: number;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  estimatedMinutes?: number;

  @Column({ type: 'text', array: true, default: [] })
  requiredSkills!: string[];

  /** Optional link to Work Center master. Populated when creating from a routing. */
  @Column({ type: 'uuid', nullable: true })
  workCenterId?: string;

  @ManyToOne(() => WorkCenterEntity, { nullable: true, onDelete: 'SET NULL' })
  workCenter?: WorkCenterEntity;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
