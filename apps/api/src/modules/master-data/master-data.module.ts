import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProductsModule } from './products/products.module';
import { WorkCentersModule } from './work-centers/work-centers.module';
import { RoutingsModule } from './routings/routings.module';
import { ErpSyncController } from './erp-sync/erp-sync.controller';
import { ErpSyncService } from './erp-sync/erp-sync.service';
import { ErpSyncProcessor } from './erp-sync/processors/erp-sync.processor';

@Module({
  imports: [
    ProductsModule,
    WorkCentersModule,
    RoutingsModule,
    BullModule.registerQueue({ name: 'erp-sync' }),
  ],
  controllers: [ErpSyncController],
  providers: [ErpSyncService, ErpSyncProcessor],
  exports: [ProductsModule, WorkCentersModule, RoutingsModule],
})
export class MasterDataModule {}
