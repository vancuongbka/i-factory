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
import { ProductEntity } from '../../products/entities/product.entity';
import { RoutingOperationEntity } from './routing-operation.entity';

@Entity('routings')
export class RoutingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  factoryId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  product?: ProductEntity;

  @Column({ length: 50 })
  code!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 20, default: '1.0' })
  version!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @OneToMany(() => RoutingOperationEntity, (op) => op.routing, { cascade: true })
  operations?: RoutingOperationEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
