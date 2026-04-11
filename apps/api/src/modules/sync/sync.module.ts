import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SyncService } from './sync.service';
import { FactorySyncProcessor } from './processors/factory-sync.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'factory-sync' })],
  providers: [SyncService, FactorySyncProcessor],
  exports: [SyncService],
})
export class SyncModule {}
