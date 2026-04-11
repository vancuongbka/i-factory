import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BomEntity } from './bom.entity';

@Entity('bom_revisions')
export class BomRevisionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  bomId!: string;

  @ManyToOne(() => BomEntity, { onDelete: 'CASCADE' })
  bom?: BomEntity;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ length: 20 })
  fromVersion!: string;

  @Column({ length: 20 })
  toVersion!: string;

  @Column({ type: 'uuid' })
  revisedBy!: string;

  @Column({ length: 1000, nullable: true })
  changeNotes?: string;

  @Column({ type: 'jsonb' })
  snapshotData!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;
}
