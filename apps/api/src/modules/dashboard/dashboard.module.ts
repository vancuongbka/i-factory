import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrderEntity } from '../production/entities/production-order.entity';
import { WorkOrderEntity } from '../work-orders/entities/work-order.entity';
import { MaterialEntity } from '../inventory/entities/material.entity';
import { QCInspectionEntity } from '../quality-control/entities/qc-inspection.entity';
import { MachineEntity } from '../master-data/work-centers/entities/machine.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrderEntity,
      WorkOrderEntity,
      MaterialEntity,
      QCInspectionEntity,
      MachineEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
