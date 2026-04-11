import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrderEntity } from './entities/work-order.entity';
import { WorkOrderStepEntity } from './entities/work-order-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrderEntity, WorkOrderStepEntity])],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
