import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Fault event record — no soft-delete; downtime events are an immutable audit trail.
 * Resolution is modelled by setting resolvedAt / resolvedBy, not by deleting the row.
 */
@Entity('machine_downtime')
export class MachineDowntimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid' })
  cncMachineId!: string;

  /** The schedule entry that was interrupted, if any. */
  @Column({ type: 'uuid', nullable: true })
  scheduleEntryId?: string;

  @Column({ type: 'uuid' })
  raisedBy!: string;

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  resolvedBy?: string;

  @Column({ length: 50 })
  faultCode!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  rootCause?: string;

  @Column({ type: 'text', nullable: true })
  correctiveAction?: string;

  /** Computed on resolution: Math.round((resolvedAt - startedAt) / 60000). */
  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;
}
