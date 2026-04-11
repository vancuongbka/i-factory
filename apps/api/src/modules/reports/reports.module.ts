import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ProductionReportProcessor } from './processors/production-report.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'reports' }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ProductionReportProcessor],
})
export class ReportsModule {}
