import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { MaterialEntity } from './entities/material.entity';
import { StockMovementEntity } from './entities/stock-movement.entity';
import { WarehouseEntity } from './entities/warehouse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialEntity, StockMovementEntity, WarehouseEntity])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
