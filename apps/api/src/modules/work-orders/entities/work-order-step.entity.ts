import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkOrderEntity } from './work-order.entity';

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

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
