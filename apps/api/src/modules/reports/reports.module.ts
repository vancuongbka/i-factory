import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ProductionReportProcessor } from './processors/production-report.processor';
import { ProductionOrderEntity } from '../production/entities/production-order.entity';
import { WorkOrderEntity } from '../work-orders/entities/work-order.entity';
import { WorkOrderStepEntity } from '../work-orders/entities/work-order-step.entity';
import { MaterialEntity } from '../inventory/entities/material.entity';
import { StockMovementEntity } from '../inventory/entities/stock-movement.entity';
import { QCInspectionEntity } from '../quality-control/entities/qc-inspection.entity';
import { QCDefectEntity } from '../quality-control/entities/qc-defect.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'reports' }),
    TypeOrmModule.forFeature([
      ProductionOrderEntity,
      WorkOrderEntity,
      WorkOrderStepEntity,
      MaterialEntity,
      StockMovementEntity,
      QCInspectionEntity,
      QCDefectEntity,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ProductionReportProcessor],
})
export class ReportsModule {}
