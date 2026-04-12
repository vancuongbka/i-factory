import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrderEntity } from './entities/work-order.entity';
import { WorkOrderStepEntity } from './entities/work-order-step.entity';
import { ProductionOrderEntity } from '../production/entities/production-order.entity';
import { MasterDataModule } from '../master-data/master-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrderEntity, WorkOrderStepEntity, ProductionOrderEntity]),
    MasterDataModule,
  ],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
