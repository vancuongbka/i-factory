import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('factories')
export class FactoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 20 })
  code!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ length: 50, default: 'Asia/Ho_Chi_Minh' })
  timezone!: string;

  @Column({ type: 'jsonb', nullable: true })
  customFieldsConfig?: Record<string, unknown>;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
