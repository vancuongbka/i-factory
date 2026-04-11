import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkCenterEntity } from '../../work-centers/entities/work-center.entity';
import { RoutingEntity } from './routing.entity';

@Entity('routing_operations')
export class RoutingOperationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  routingId!: string;

  @ManyToOne(() => RoutingEntity, (r) => r.operations, { onDelete: 'CASCADE' })
  routing?: RoutingEntity;

  @Column({ type: 'int' })
  sequence!: number;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'uuid' })
  workCenterId!: string;

  @ManyToOne(() => WorkCenterEntity, { onDelete: 'RESTRICT' })
  workCenter?: WorkCenterEntity;

  @Column({ type: 'int', default: 0 })
  setupTimeMinutes!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cycleTimeMinutes!: number;

  @Column({ type: 'uuid', array: true, default: [] })
  machineIds!: string[];

  @Column({ type: 'text', array: true, default: [] })
  requiredSkills!: string[];

  @Column({ type: 'text', nullable: true })
  workInstructions?: string;

  @Column({ default: false })
  isOptional!: boolean;
}
